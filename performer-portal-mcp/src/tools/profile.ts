// Profile Manager Tools - Bio, photos, genre selection

import { z } from 'zod';
import type { PerformerProfile, Photo, SocialLink, EnrollmentStatus } from '../types/index.js';
import { generateId, profiles, getPerformerById } from '../utils/dataStore.js';

// Input schemas
export const createProfileSchema = z.object({
  stageName: z.string().min(1).describe('The performer stage name'),
  realName: z.string().optional().describe('The performer real name (optional)'),
  bio: z.string().describe('Biography/description of the performer'),
  genres: z.array(z.string()).describe('List of music genres the performer specializes in'),
});

export const getProfileSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const updateProfileSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  stageName: z.string().optional().describe('Updated stage name'),
  realName: z.string().optional().describe('Updated real name'),
  bio: z.string().optional().describe('Updated biography'),
  genres: z.array(z.string()).optional().describe('Updated list of genres'),
});

export const addPhotoSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  url: z.string().url().describe('URL of the photo'),
  caption: z.string().optional().describe('Caption for the photo'),
  isPrimary: z.boolean().optional().default(false).describe('Whether this is the primary profile photo'),
});

export const removePhotoSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  photoId: z.string().describe('The unique identifier of the photo to remove'),
});

export const setPrimaryPhotoSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  photoId: z.string().describe('The unique identifier of the photo to set as primary'),
});

export const updateSocialLinksSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  socialLinks: z.array(
    z.object({
      platform: z.enum(['instagram', 'twitter', 'soundcloud', 'spotify', 'youtube', 'tiktok', 'other']),
      url: z.string().url(),
    })
  ).describe('List of social media links'),
});

export const updateGenresSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  genres: z.array(z.string()).describe('Updated list of music genres'),
});

export const enrollPerformerSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  status: z.enum(['pending', 'approved', 'active', 'suspended']).describe('New enrollment status'),
});

// Tool implementations
export function createProfile(input: z.infer<typeof createProfileSchema>): PerformerProfile {
  const performerId = generateId();
  const now = new Date();

  const profile: PerformerProfile = {
    id: performerId,
    stageName: input.stageName,
    realName: input.realName,
    bio: input.bio,
    genres: input.genres,
    photos: [],
    socialLinks: [],
    isLive: false,
    enrollmentStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  profiles.set(performerId, profile);
  return profile;
}

export function getProfile(input: z.infer<typeof getProfileSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }
  return profile;
}

export function updateProfile(input: z.infer<typeof updateProfileSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  if (input.stageName !== undefined) profile.stageName = input.stageName;
  if (input.realName !== undefined) profile.realName = input.realName;
  if (input.bio !== undefined) profile.bio = input.bio;
  if (input.genres !== undefined) profile.genres = input.genres;

  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function addPhoto(input: z.infer<typeof addPhotoSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  const photo: Photo = {
    id: generateId(),
    url: input.url,
    caption: input.caption,
    isPrimary: input.isPrimary || false,
    uploadedAt: new Date(),
  };

  // If this is set as primary, unset other primary photos
  if (photo.isPrimary) {
    profile.photos.forEach((p) => (p.isPrimary = false));
  }

  // If this is the first photo, make it primary
  if (profile.photos.length === 0) {
    photo.isPrimary = true;
  }

  profile.photos.push(photo);
  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function removePhoto(input: z.infer<typeof removePhotoSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  const photoIndex = profile.photos.findIndex((p) => p.id === input.photoId);
  if (photoIndex === -1) {
    throw new Error(`Photo with ID ${input.photoId} not found`);
  }

  const removedPhoto = profile.photos[photoIndex];
  profile.photos.splice(photoIndex, 1);

  // If removed photo was primary and there are other photos, make first one primary
  if (removedPhoto.isPrimary && profile.photos.length > 0) {
    profile.photos[0].isPrimary = true;
  }

  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function setPrimaryPhoto(input: z.infer<typeof setPrimaryPhotoSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  const photo = profile.photos.find((p) => p.id === input.photoId);
  if (!photo) {
    throw new Error(`Photo with ID ${input.photoId} not found`);
  }

  // Unset all primary flags and set the new one
  profile.photos.forEach((p) => (p.isPrimary = false));
  photo.isPrimary = true;

  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function updateSocialLinks(input: z.infer<typeof updateSocialLinksSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  profile.socialLinks = input.socialLinks as SocialLink[];
  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function updateGenres(input: z.infer<typeof updateGenresSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  profile.genres = input.genres;
  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

export function enrollPerformer(input: z.infer<typeof enrollPerformerSchema>): PerformerProfile {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  profile.enrollmentStatus = input.status;
  profile.updatedAt = new Date();
  profiles.set(input.performerId, profile);

  return profile;
}

// Tool definitions for MCP registration
export const profileTools = [
  {
    name: 'create_profile',
    description: 'Create a new performer profile with stage name, bio, and genres',
    inputSchema: {
      type: 'object',
      properties: {
        stageName: { type: 'string', description: 'The performer stage name' },
        realName: { type: 'string', description: 'The performer real name (optional)' },
        bio: { type: 'string', description: 'Biography/description of the performer' },
        genres: { type: 'array', items: { type: 'string' }, description: 'List of music genres' },
      },
      required: ['stageName', 'bio', 'genres'],
    },
  },
  {
    name: 'get_profile',
    description: 'Retrieve a performer profile by ID',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'update_profile',
    description: 'Update performer profile information including stage name, bio, and genres',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        stageName: { type: 'string', description: 'Updated stage name' },
        realName: { type: 'string', description: 'Updated real name' },
        bio: { type: 'string', description: 'Updated biography' },
        genres: { type: 'array', items: { type: 'string' }, description: 'Updated list of genres' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'add_photo',
    description: 'Add a new photo to the performer profile',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        url: { type: 'string', description: 'URL of the photo' },
        caption: { type: 'string', description: 'Caption for the photo' },
        isPrimary: { type: 'boolean', description: 'Whether this is the primary profile photo' },
      },
      required: ['performerId', 'url'],
    },
  },
  {
    name: 'remove_photo',
    description: 'Remove a photo from the performer profile',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        photoId: { type: 'string', description: 'The unique identifier of the photo to remove' },
      },
      required: ['performerId', 'photoId'],
    },
  },
  {
    name: 'set_primary_photo',
    description: 'Set a specific photo as the primary profile photo',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        photoId: { type: 'string', description: 'The unique identifier of the photo to set as primary' },
      },
      required: ['performerId', 'photoId'],
    },
  },
  {
    name: 'update_social_links',
    description: 'Update social media links for the performer profile',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        socialLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['instagram', 'twitter', 'soundcloud', 'spotify', 'youtube', 'tiktok', 'other'],
              },
              url: { type: 'string' },
            },
            required: ['platform', 'url'],
          },
          description: 'List of social media links',
        },
      },
      required: ['performerId', 'socialLinks'],
    },
  },
  {
    name: 'update_genres',
    description: 'Update the list of music genres for the performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        genres: { type: 'array', items: { type: 'string' }, description: 'Updated list of music genres' },
      },
      required: ['performerId', 'genres'],
    },
  },
  {
    name: 'enroll_performer',
    description: 'Update performer enrollment status (pending, approved, active, suspended)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'active', 'suspended'],
          description: 'New enrollment status',
        },
      },
      required: ['performerId', 'status'],
    },
  },
];
