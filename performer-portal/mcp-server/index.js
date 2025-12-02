#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// In-memory storage (in production, use a real database)
const performers = new Map();
const tipMenus = new Map();
const earnings = new Map();
const songRequests = new Map();
const chatSessions = new Map();

// Initialize MCP server
const server = new Server(
  {
    name: "performer-portal-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Create or update performer profile
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_performer_profile",
        description: "Create or update a performer profile with bio, schedule, and settings",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Unique identifier for the performer",
            },
            display_name: {
              type: "string",
              description: "Public display name",
            },
            bio: {
              type: "string",
              description: "Performer biography",
            },
            profile_image_url: {
              type: "string",
              description: "URL to profile image",
            },
            social_links: {
              type: "object",
              description: "Social media links (twitter, instagram, etc.)",
            },
            schedule: {
              type: "array",
              description: "Weekly schedule with days and time slots",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  start_time: { type: "string" },
                  end_time: { type: "string" },
                },
              },
            },
            categories: {
              type: "array",
              description: "Performance categories (DJ, dancer, musician, etc.)",
              items: { type: "string" },
            },
          },
          required: ["performer_id", "display_name"],
        },
      },
      {
        name: "get_performer_profile",
        description: "Retrieve performer profile information",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID to retrieve",
            },
          },
          required: ["performer_id"],
        },
      },
      {
        name: "configure_tip_menu",
        description: "Set up or update tip menu with custom actions and amounts",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
            menu_items: {
              type: "array",
              description: "Array of tip menu items",
              items: {
                type: "object",
                properties: {
                  item_id: { type: "string" },
                  title: { type: "string", description: "Action title (e.g., 'Request Song', 'Special Move')" },
                  description: { type: "string" },
                  amount: { type: "number", description: "Tip amount in cents" },
                  icon: { type: "string", description: "Emoji or icon" },
                  lovense_enabled: { type: "boolean", description: "Trigger Lovense device" },
                  lovense_pattern: { type: "string", description: "Vibration pattern" },
                },
                required: ["item_id", "title", "amount"],
              },
            },
          },
          required: ["performer_id", "menu_items"],
        },
      },
      {
        name: "get_tip_menu",
        description: "Retrieve current tip menu configuration",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
          },
          required: ["performer_id"],
        },
      },
      {
        name: "record_tip",
        description: "Record a tip transaction for earnings tracking",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
            amount: {
              type: "number",
              description: "Tip amount in cents",
            },
            tipper_name: {
              type: "string",
              description: "Name of the person tipping",
            },
            message: {
              type: "string",
              description: "Optional message with tip",
            },
            tip_item_id: {
              type: "string",
              description: "Associated tip menu item ID",
            },
            stripe_payment_id: {
              type: "string",
              description: "Stripe payment intent ID",
            },
          },
          required: ["performer_id", "amount"],
        },
      },
      {
        name: "get_earnings",
        description: "Get earnings data for a performer with date range filtering",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
            start_date: {
              type: "string",
              description: "Start date (ISO 8601 format)",
            },
            end_date: {
              type: "string",
              description: "End date (ISO 8601 format)",
            },
            group_by: {
              type: "string",
              enum: ["day", "week", "month"],
              description: "Group earnings by time period",
            },
          },
          required: ["performer_id"],
        },
      },
      {
        name: "submit_song_request",
        description: "Submit a song request to the DJ/performer",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer/DJ ID",
            },
            requester_name: {
              type: "string",
              description: "Name of the person requesting",
            },
            song_title: {
              type: "string",
              description: "Song title",
            },
            artist: {
              type: "string",
              description: "Artist name",
            },
            tip_amount: {
              type: "number",
              description: "Tip amount for priority request (optional)",
            },
            message: {
              type: "string",
              description: "Optional message to DJ",
            },
          },
          required: ["performer_id", "requester_name", "song_title", "artist"],
        },
      },
      {
        name: "manage_song_request",
        description: "Accept, reject, or complete a song request",
        inputSchema: {
          type: "object",
          properties: {
            request_id: {
              type: "string",
              description: "Song request ID",
            },
            action: {
              type: "string",
              enum: ["accept", "reject", "complete", "queue"],
              description: "Action to take on the request",
            },
            queue_position: {
              type: "number",
              description: "Position in queue if action is 'queue'",
            },
            rejection_reason: {
              type: "string",
              description: "Reason for rejection (if applicable)",
            },
          },
          required: ["request_id", "action"],
        },
      },
      {
        name: "get_song_requests",
        description: "Get all song requests for a performer with filtering",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer/DJ ID",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "queued", "completed", "rejected"],
              description: "Filter by request status",
            },
          },
          required: ["performer_id"],
        },
      },
      {
        name: "send_chat_message",
        description: "Send a chat message in the performer's room",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
            sender_name: {
              type: "string",
              description: "Name of the message sender",
            },
            sender_type: {
              type: "string",
              enum: ["performer", "viewer", "moderator"],
              description: "Type of sender",
            },
            message: {
              type: "string",
              description: "Chat message content",
            },
            reply_to: {
              type: "string",
              description: "Message ID being replied to (optional)",
            },
          },
          required: ["performer_id", "sender_name", "sender_type", "message"],
        },
      },
      {
        name: "get_chat_history",
        description: "Retrieve chat history for a performer's room",
        inputSchema: {
          type: "object",
          properties: {
            performer_id: {
              type: "string",
              description: "Performer ID",
            },
            limit: {
              type: "number",
              description: "Number of messages to retrieve (default 50)",
            },
          },
          required: ["performer_id"],
        },
      },
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "create_performer_profile": {
        const profile = {
          performer_id: args.performer_id,
          display_name: args.display_name,
          bio: args.bio || "",
          profile_image_url: args.profile_image_url || "",
          social_links: args.social_links || {},
          schedule: args.schedule || [],
          categories: args.categories || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        performers.set(args.performer_id, profile);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Performer profile created successfully",
                profile,
              }, null, 2),
            },
          ],
        };
      }

      case "get_performer_profile": {
        const profile = performers.get(args.performer_id);
        if (!profile) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Performer not found",
                }, null, 2),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, profile }, null, 2),
            },
          ],
        };
      }

      case "configure_tip_menu": {
        const menu = {
          performer_id: args.performer_id,
          menu_items: args.menu_items.map(item => ({
            ...item,
            created_at: new Date().toISOString(),
          })),
          updated_at: new Date().toISOString(),
        };
        tipMenus.set(args.performer_id, menu);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Tip menu configured successfully",
                menu,
              }, null, 2),
            },
          ],
        };
      }

      case "get_tip_menu": {
        const menu = tipMenus.get(args.performer_id);
        if (!menu) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Tip menu not found",
                }, null, 2),
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, menu }, null, 2),
            },
          ],
        };
      }

      case "record_tip": {
        const tip = {
          tip_id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          performer_id: args.performer_id,
          amount: args.amount,
          tipper_name: args.tipper_name || "Anonymous",
          message: args.message || "",
          tip_item_id: args.tip_item_id || null,
          stripe_payment_id: args.stripe_payment_id || null,
          timestamp: new Date().toISOString(),
        };

        const performerEarnings = earnings.get(args.performer_id) || [];
        performerEarnings.push(tip);
        earnings.set(args.performer_id, performerEarnings);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Tip recorded successfully",
                tip,
              }, null, 2),
            },
          ],
        };
      }

      case "get_earnings": {
        const performerEarnings = earnings.get(args.performer_id) || [];
        let filteredEarnings = performerEarnings;

        // Filter by date range if provided
        if (args.start_date || args.end_date) {
          filteredEarnings = performerEarnings.filter(tip => {
            const tipDate = new Date(tip.timestamp);
            if (args.start_date && tipDate < new Date(args.start_date)) return false;
            if (args.end_date && tipDate > new Date(args.end_date)) return false;
            return true;
          });
        }

        const total = filteredEarnings.reduce((sum, tip) => sum + tip.amount, 0);
        const count = filteredEarnings.length;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                performer_id: args.performer_id,
                total_earnings: total,
                tip_count: count,
                average_tip: count > 0 ? Math.round(total / count) : 0,
                tips: filteredEarnings,
              }, null, 2),
            },
          ],
        };
      }

      case "submit_song_request": {
        const request = {
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          performer_id: args.performer_id,
          requester_name: args.requester_name,
          song_title: args.song_title,
          artist: args.artist,
          tip_amount: args.tip_amount || 0,
          message: args.message || "",
          status: "pending",
          submitted_at: new Date().toISOString(),
        };

        const requests = songRequests.get(args.performer_id) || [];
        requests.push(request);
        songRequests.set(args.performer_id, requests);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Song request submitted successfully",
                request,
              }, null, 2),
            },
          ],
        };
      }

      case "manage_song_request": {
        let found = false;
        for (const [performerId, requests] of songRequests.entries()) {
          const request = requests.find(r => r.request_id === args.request_id);
          if (request) {
            request.status = args.action === "queue" ? "queued" : args.action + "ed";
            if (args.queue_position) request.queue_position = args.queue_position;
            if (args.rejection_reason) request.rejection_reason = args.rejection_reason;
            request.updated_at = new Date().toISOString();
            found = true;
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: true,
                    message: `Song request ${request.status}`,
                    request,
                  }, null, 2),
                },
              ],
            };
          }
        }
        if (!found) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Song request not found",
                }, null, 2),
              },
            ],
          };
        }
        break;
      }

      case "get_song_requests": {
        const requests = songRequests.get(args.performer_id) || [];
        const filtered = args.status
          ? requests.filter(r => r.status === args.status)
          : requests;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                performer_id: args.performer_id,
                count: filtered.length,
                requests: filtered.sort((a, b) =>
                  new Date(b.submitted_at) - new Date(a.submitted_at)
                ),
              }, null, 2),
            },
          ],
        };
      }

      case "send_chat_message": {
        const message = {
          message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          performer_id: args.performer_id,
          sender_name: args.sender_name,
          sender_type: args.sender_type,
          message: args.message,
          reply_to: args.reply_to || null,
          timestamp: new Date().toISOString(),
        };

        const chat = chatSessions.get(args.performer_id) || [];
        chat.push(message);
        chatSessions.set(args.performer_id, chat);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Chat message sent",
                chat_message: message,
              }, null, 2),
            },
          ],
        };
      }

      case "get_chat_history": {
        const chat = chatSessions.get(args.performer_id) || [];
        const limit = args.limit || 50;
        const recent = chat.slice(-limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                performer_id: args.performer_id,
                message_count: recent.length,
                messages: recent,
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: `Unknown tool: ${name}`,
              }, null, 2),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Performer Portal MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
