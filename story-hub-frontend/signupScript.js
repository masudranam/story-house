// signupScript.ts
import axios from 'axios';

const baseURL = 'http://localhost:3000/users/signup';

const createUser = (i) => ({
  name: `${i}`,
  username: `${i}`,
  email: `${i}@example.com`,
  password: 'Test@12345',
});

 

const signUpUsers = async () => {
  for (let i = 4000; i <= 500000; i++) {
    try {
      
      const user = createUser(i);
      await axios.post(baseURL, user);
      if (i % 100 === 0) console.log(`Signed up ${i} users`);
    } catch (err) {
      console.error(`Failed at ${i}`, err.response?.data || err.message);
    }
  }
};

signUpUsers();
