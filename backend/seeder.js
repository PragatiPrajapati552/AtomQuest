const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const GoalSheet = require('./models/GoalSheet');
const Goal = require('./models/Goal');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const users = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Manager User',
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager'
  }
];

const seedData = async () => {
  try {
    await User.deleteMany();
    await GoalSheet.deleteMany();
    await Goal.deleteMany();

    const createdUsers = await User.create(users);

    const managerId = createdUsers[1]._id;

    await User.create({
      name: 'Employee User',
      email: 'employee@test.com',
      password: 'password123',
      role: 'employee',
      managerId: managerId
    });

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  seedData();
} else {
  console.log('Use -i to import');
  process.exit();
}
