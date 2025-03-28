// Test script for local storage database
const { 
  initLocalStorageDB, 
  isLocalStorageDBActive, 
  clearLocalStorageDB, 
  Collections,
  findAll,
  findById,
  insertOne,
  updateOne,
  deleteOne
} = require('./lib/local-storage-db');

async function testLocalStorageDB() {
  console.log('Testing local storage database...');
  
  // Initialize
  console.log('Initializing local storage database...');
  const initialized = await initLocalStorageDB();
  console.log('Initialized:', initialized);
  
  // Check if active
  const isActive = await isLocalStorageDBActive();
  console.log('Is active:', isActive);
  
  if (!isActive) {
    console.error('Local storage database is not active! Exiting...');
    return;
  }
  
  // Test collection operations
  console.log('\nTesting collection operations...');
  
  // Create a test playbook
  console.log('\nCreating test playbook...');
  const newPlaybook = await insertOne(Collections.PLAYBOOKS, {
    name: 'Test Playbook',
    description: 'This is a test playbook',
    songs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Created playbook:', newPlaybook);
  
  // Find all playbooks
  console.log('\nFinding all playbooks...');
  const playbooks = await findAll(Collections.PLAYBOOKS);
  console.log('Found playbooks:', playbooks);
  
  // Find playbook by ID
  console.log('\nFinding playbook by ID...');
  const foundPlaybook = await findById(Collections.PLAYBOOKS, newPlaybook._id);
  console.log('Found playbook:', foundPlaybook);
  
  // Update playbook
  console.log('\nUpdating playbook...');
  const updatedPlaybook = await updateOne(Collections.PLAYBOOKS, newPlaybook._id, {
    name: 'Updated Test Playbook',
    updatedAt: new Date()
  });
  console.log('Updated playbook:', updatedPlaybook);
  
  // Create a test song
  console.log('\nCreating test song...');
  const newSong = await insertOne(Collections.SONGS, {
    title: 'Test Song',
    key: 'C',
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Created song:', newSong);
  
  // Add song to playbook
  console.log('\nAdding song to playbook...');
  const updatedPlaybookWithSong = await updateOne(Collections.PLAYBOOKS, newPlaybook._id, {
    songs: [newSong],
    updatedAt: new Date()
  });
  console.log('Updated playbook with song:', updatedPlaybookWithSong);
  
  // Delete song
  console.log('\nDeleting song...');
  const songDeleted = await deleteOne(Collections.SONGS, newSong._id);
  console.log('Song deleted:', songDeleted);
  
  // Delete playbook
  console.log('\nDeleting playbook...');
  const playbookDeleted = await deleteOne(Collections.PLAYBOOKS, newPlaybook._id);
  console.log('Playbook deleted:', playbookDeleted);
  
  // Clear database
  console.log('\nClearing database...');
  const cleared = await clearLocalStorageDB();
  console.log('Database cleared:', cleared);
  
  console.log('\nTest completed successfully!');
}

// Run the test
testLocalStorageDB().catch(error => {
  console.error('Test failed with error:', error);
}); 