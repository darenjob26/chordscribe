import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testSong = {
  title: 'Test Song',
  key: 'C',
  sections: [
    {
      name: 'Verse 1',
      lines: [
        {
          chords: [
            {
              root: 'C',
              quality: 'major',
              interval: '1',
              timing: 1
            }
          ]
        }
      ]
    }
  ]
};

const testPlaybook = {
  name: 'Test Playbook',
  description: 'A test playbook for testing purposes'
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testSongOperations() {
  console.log('\n=== Testing Song Operations ===');
  
  // Create song
  console.log('\nCreating song...');
  const createSongResponse = await fetch(`${BASE_URL}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testSong)
  });
  const createdSong = await createSongResponse.json();
  console.log('Created song:', createdSong);

  // Get all songs
  console.log('\nGetting all songs...');
  const getSongsResponse = await fetch(`${BASE_URL}/songs`);
  const songs = await getSongsResponse.json();
  console.log('All songs:', songs);

  // Get song by ID
  console.log('\nGetting song by ID...');
  const getSongResponse = await fetch(`${BASE_URL}/songs/${createdSong._id}`);
  const song = await getSongResponse.json();
  console.log('Song by ID:', song);

  // Update song
  console.log('\nUpdating song...');
  const updatedSong = {
    ...testSong,
    title: 'Updated Test Song'
  };
  const updateSongResponse = await fetch(`${BASE_URL}/songs/${createdSong._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSong)
  });
  const updatedSongResult = await updateSongResponse.json();
  console.log('Updated song:', updatedSongResult);

  // Delete song
  console.log('\nDeleting song...');
  const deleteSongResponse = await fetch(`${BASE_URL}/songs/${createdSong._id}`, {
    method: 'DELETE'
  });
  const deleteResult = await deleteSongResponse.json();
  console.log('Delete result:', deleteResult);

  return createdSong._id;
}

async function testPlaybookOperations() {
  console.log('\n=== Testing Playbook Operations ===');
  
  // Create playbook
  console.log('\nCreating playbook...');
  const createPlaybookResponse = await fetch(`${BASE_URL}/playbooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPlaybook)
  });
  const createdPlaybook = await createPlaybookResponse.json();
  console.log('Created playbook:', createdPlaybook);

  // Get all playbooks
  console.log('\nGetting all playbooks...');
  const getPlaybooksResponse = await fetch(`${BASE_URL}/playbooks`);
  const playbooks = await getPlaybooksResponse.json();
  console.log('All playbooks:', playbooks);

  // Get playbook by ID
  console.log('\nGetting playbook by ID...');
  const getPlaybookResponse = await fetch(`${BASE_URL}/playbooks/${createdPlaybook._id}`);
  const playbook = await getPlaybookResponse.json();
  console.log('Playbook by ID:', playbook);

  // Update playbook
  console.log('\nUpdating playbook...');
  const updatedPlaybook = {
    ...testPlaybook,
    name: 'Updated Test Playbook'
  };
  const updatePlaybookResponse = await fetch(`${BASE_URL}/playbooks/${createdPlaybook._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPlaybook)
  });
  const updatedPlaybookResult = await updatePlaybookResponse.json();
  console.log('Updated playbook:', updatedPlaybookResult);

  // Delete playbook
  console.log('\nDeleting playbook...');
  const deletePlaybookResponse = await fetch(`${BASE_URL}/playbooks/${createdPlaybook._id}`, {
    method: 'DELETE'
  });
  const deleteResult = await deletePlaybookResponse.json();
  console.log('Delete result:', deleteResult);

  return createdPlaybook._id;
}

// Main test function
async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Test song operations
    await testSongOperations();
    
    // Add a small delay between tests
    await delay(1000);
    
    // Test playbook operations
    await testPlaybookOperations();
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 