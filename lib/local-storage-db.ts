import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const LOCAL_DB_STATUS_KEY = '@local_db_active';
const LOCAL_DB_PREFIX = '@local_db_';

// Collection names
export enum Collections {
  PLAYBOOKS = 'playbooks',
  SONGS = 'songs',
  SECTIONS = 'sections',
  LINES = 'lines',
  CHORDS = 'chords',
}

// Status interface
interface LocalDBStatus {
  active: boolean;
  initialized: number; // timestamp
}

// Generic collection item interface
interface CollectionItem {
  _id: string;
  [key: string]: any;
}

/**
 * Initialize the local storage database
 * This sets up the necessary storage structure and marks the DB as active
 */
export const initLocalStorageDB = async (): Promise<boolean> => {
  try {
    // Check if already initialized
    const isActive = await isLocalStorageDBActive();
    if (isActive) {
      console.log('Local storage DB already initialized');
      return true;
    }

    // Initialize all collections with empty arrays
    const collections = Object.values(Collections);
    for (const collection of collections) {
      await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify([]));
    }

    // Mark as active
    const status: LocalDBStatus = {
      active: true,
      initialized: Date.now(),
    };
    await AsyncStorage.setItem(LOCAL_DB_STATUS_KEY, JSON.stringify(status));
    
    console.log('Local storage DB initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize local storage DB:', error);
    return false;
  }
};

/**
 * Check if the local storage database is active
 */
export const isLocalStorageDBActive = async (): Promise<boolean> => {
  try {
    const statusJson = await AsyncStorage.getItem(LOCAL_DB_STATUS_KEY);
    if (!statusJson) return false;
    
    const status: LocalDBStatus = JSON.parse(statusJson);
    return status.active;
  } catch (error) {
    console.error('Error checking local DB status:', error);
    return false;
  }
};

/**
 * Clear all data in the local storage database
 * This keeps the database active but empties all collections
 */
export const clearLocalStorageDB = async (): Promise<boolean> => {
  try {
    // Check if initialized
    const isActive = await isLocalStorageDBActive();
    if (!isActive) {
      console.log('Local storage DB is not active');
      return false;
    }

    // Clear all collections with empty arrays
    const collections = Object.values(Collections);
    for (const collection of collections) {
      await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify([]));
    }
    
    console.log('Local storage DB cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear local storage DB:', error);
    return false;
  }
};

/**
 * Stop the local storage database
 * This marks the database as inactive
 */
export const stopLocalStorageDB = async (): Promise<boolean> => {
  try {
    // Update status to inactive
    const status: LocalDBStatus = {
      active: false,
      initialized: Date.now(),
    };
    await AsyncStorage.setItem(LOCAL_DB_STATUS_KEY, JSON.stringify(status));
    
    console.log('Local storage DB stopped successfully');
    return true;
  } catch (error) {
    console.error('Failed to stop local storage DB:', error);
    return false;
  }
};

/**
 * Generic collection operations
 */

/**
 * Find all items in a collection
 */
export const findAll = async <T>(collection: Collections): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(`${LOCAL_DB_PREFIX}${collection}`);
    if (!data) return [];
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error finding all in ${collection}:`, error);
    return [];
  }
};

/**
 * Find an item by ID in a collection
 */
export const findById = async <T>(collection: Collections, id: string): Promise<T | null> => {
  try {
    const items = await findAll<CollectionItem>(collection);
    const item = items.find(item => item._id === id);
    return item as T || null;
  } catch (error) {
    console.error(`Error finding by ID in ${collection}:`, error);
    return null;
  }
};

/**
 * Find an item matching a filter in a collection
 */
export const findOne = async <T>(
  collection: Collections, 
  filter: Record<string, any>
): Promise<T | null> => {
  try {
    const items = await findAll<CollectionItem>(collection);
    
    // Simple filter implementation
    const item = items.find(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    
    return item as T || null;
  } catch (error) {
    console.error(`Error finding one in ${collection}:`, error);
    return null;
  }
};

/**
 * Insert an item into a collection
 */
export const insertOne = async <T extends CollectionItem>(
  collection: Collections,
  item: Omit<T, '_id'>
): Promise<T | null> => {
  try {
    const items = await findAll<T>(collection);
    
    // Generate a new ID
    const newItem = {
      ...item,
      _id: uuidv4(),
    } as T;
    
    // Add to collection
    items.push(newItem);
    await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify(items));
    
    return newItem;
  } catch (error) {
    console.error(`Error inserting one in ${collection}:`, error);
    return null;
  }
};

/**
 * Update an item in a collection
 */
export const updateOne = async <T extends CollectionItem>(
  collection: Collections,
  id: string,
  update: Partial<T>
): Promise<T | null> => {
  try {
    const items = await findAll<T>(collection);
    
    // Find the item index
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    // Update the item
    const updatedItem = {
      ...items[index],
      ...update,
      _id: id, // Ensure ID doesn't change
    } as T;
    
    items[index] = updatedItem;
    await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify(items));
    
    return updatedItem;
  } catch (error) {
    console.error(`Error updating one in ${collection}:`, error);
    return null;
  }
};

/**
 * Delete an item from a collection
 */
export const deleteOne = async <T>(
  collection: Collections,
  id: string
): Promise<boolean> => {
  try {
    const items = await findAll<CollectionItem>(collection);
    
    // Filter out the item
    const newItems = items.filter(item => item._id !== id);
    
    // If nothing was removed, return false
    if (newItems.length === items.length) return false;
    
    await AsyncStorage.setItem(`${LOCAL_DB_PREFIX}${collection}`, JSON.stringify(newItems));
    return true;
  } catch (error) {
    console.error(`Error deleting one in ${collection}:`, error);
    return false;
  }
};

/**
 * Get a MongoDB-like connection string for the local storage DB
 * This is used for compatibility with the MongoDB provider
 */
export const getLocalStorageURI = (): string => {
  return 'mongodb://localhost:27017/localstorage';
}; 