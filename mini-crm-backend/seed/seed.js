require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');
const Customer = require('../src/models/Customer');
const Task = require('../src/models/Task');

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function name() {
  const first = ['Alex','Jordan','Taylor','Sam','Chris','Morgan','Priya','Aisha','Rahul','Ishan','Neha','Riya'];
  const last = ['Sharma','Patel','Singh','Khan','Gupta','Verma','Doe','Lee','Kim','Brown','Garcia','Miller'];
  return `${rand(first)} ${rand(last)}`;
}
function email(n) {
  const domains = ['example.com','mail.com','corp.co','test.org'];
  return `${n.toLowerCase().replace(/\s+/g,'.')}@${rand(domains)}`;
}
function phone() { return '+91' + Math.floor(6000000000 + Math.random()*3999999999); }

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Lead.deleteMany({}), Customer.deleteMany({}), Task.deleteMany({})]);

  // Users
  const admin = await User.create({ name: 'Admin User', email: 'admin@crm.com', password: 'Admin@123', role: 'admin' });
  const agent1 = await User.create({ name: 'Agent One', email: 'agent1@crm.com', password: 'Agent@123', role: 'agent' });
  const agent2 = await User.create({ name: 'Agent Two', email: 'agent2@crm.com', password: 'Agent@123', role: 'agent' });

  // Leads
  const statuses = ['New','In Progress','Closed Won','Closed Lost'];
  const sources = ['Website','Referral','Cold Call','LinkedIn','Email'];
  const leads = [];
  for (let i=0;i<10;i++) {
    const n = name();
    const assignedAgent = i % 2 === 0 ? agent1._id : agent2._id;
    leads.push({
      name: n,
      email: email(n),
      phone: phone(),
      status: rand(statuses),
      source: rand(sources),
      assignedAgent,
      history: [{ action: 'seeded' }]
    });
  }
  await Lead.insertMany(leads);

  // Customers
  const customers = [];
  for (let i=0;i<5;i++) {
    const n = name();
    const owner = i % 2 === 0 ? agent1._id : agent2._id;
    customers.push({
      name: n,
      company: rand(['Acme Inc','Globex','Initech','Umbrella','Stark Industries']),
      email: email(n),
      phone: phone(),
      owner,
      tags: ['vip']
    });
  }
  const insertedCustomers = await Customer.insertMany(customers);

  // Tasks
  const tasks = [];
  for (let i=0;i<8;i++) {
    const owner = i % 2 === 0 ? agent1._id : agent2._id;
    const related = i % 2 === 0 ? { type: 'Lead', id: (await Lead.findOne())._id } : { type: 'Customer', id: insertedCustomers[i % insertedCustomers.length]._id };
    const due = new Date(Date.now() + (i-3)*24*60*60*1000);
    tasks.push({
      title: `Follow up ${i+1}`,
      dueDate: due,
      status: rand(['Open','In Progress','Done']),
      priority: rand(['Low','Medium','High']),
      relatedType: related.type,
      relatedId: related.id,
      owner
    });
  }
  await Task.insertMany(tasks);

  console.log('✅ Seed complete');
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (e) => { console.error(e); await mongoose.disconnect(); process.exit(1); });
