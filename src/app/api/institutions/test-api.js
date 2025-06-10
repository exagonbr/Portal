// Simple test script for the institutions API
// Run with: node test-api.js

const fetch = require('node-fetch');

// Base URL for the API
const API_URL = 'http://localhost:3001/api';

// Mock JWT token for authentication (replace with a valid token in a real scenario)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlN5c3RlbSBBZG1pbiIsInJvbGUiOiJTWVNURU1fQURNSU4iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Test data for a new institution
const newInstitution = {
  name: "Escola Técnica de Teste",
  cnpj: "12345678901234",
  email: "contato@escolateste.edu.br",
  phone: "1122334455",
  address: {
    street: "Rua das Flores",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234567"
  },
  website: "https://escolateste.edu.br",
  type: "PRIVATE",
  active: true,
  settings: {
    allowStudentRegistration: true,
    requireEmailVerification: true,
    maxSchools: 5,
    maxUsersPerSchool: 500
  }
};

// Update data
const updateData = {
  name: "Escola Técnica de Teste - Atualizada",
  phone: "5544332211",
  active: true
};

// Function to create a new institution
async function createInstitution() {
  try {
    const response = await fetch(`${API_URL}/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(newInstitution)
    });
    
    const data = await response.json();
    console.log('Create Institution Response:', data);
    
    if (data.success && data.data && data.data.id) {
      return data.data.id;
    } else {
      throw new Error('Failed to create institution');
    }
  } catch (error) {
    console.error('Error creating institution:', error);
    throw error;
  }
}

// Function to update an institution
async function updateInstitution(id) {
  try {
    const response = await fetch(`${API_URL}/institutions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    console.log('Update Institution Response:', data);
    return data;
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
}

// Function to get an institution
async function getInstitution(id) {
  try {
    const response = await fetch(`${API_URL}/institutions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const data = await response.json();
    console.log('Get Institution Response:', data);
    return data;
  } catch (error) {
    console.error('Error getting institution:', error);
    throw error;
  }
}

// Function to test the wrong PUT endpoint
async function testWrongPutEndpoint() {
  try {
    const response = await fetch(`${API_URL}/institutions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({...updateData, id: 'some-id'})
    });
    
    const data = await response.json();
    console.log('Wrong PUT Endpoint Response:', data);
    return data;
  } catch (error) {
    console.error('Error testing wrong PUT endpoint:', error);
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    console.log('Testing wrong PUT endpoint (should return 405 Method Not Allowed)...');
    await testWrongPutEndpoint();
    
    console.log('\nCreating a new institution...');
    const id = await createInstitution();
    
    console.log('\nUpdating the institution...');
    await updateInstitution(id);
    
    console.log('\nGetting the updated institution...');
    await getInstitution(id);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();