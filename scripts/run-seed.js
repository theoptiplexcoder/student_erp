const axios = require('axios');

async function seed() {
  try {
    const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'admin@demo-institute.test',
      password: 'wasdwasd12',
    });

    const token = loginRes.data.accessToken;

    const seedRes = await axios.post(
      'http://localhost:4000/api/v1/admin/demo/seed-student-portal',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log(seedRes.data);
  } catch (err) {
    console.error('Error seeding data:', err.response?.data || err.message);
  }
}

seed();
