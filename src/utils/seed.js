import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Tenant } from '../models/tenant.model.js';
import {User} from '../models/User.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notes-saas'

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Tenant.deleteMany({});
  await User.deleteMany({});

  const acme = new Tenant({ name: 'Acme', plan: 'free', maxNotes: 3 })
  const globex = new Tenant({ name: 'Globex', plan: 'free', maxNotes: 3 })
  await acme.save()
  await globex.save()

  const password = 'password'
  const pHash = await bcrypt.hash(password, 10)

  const users = [
    { email: 'admin@acme.test', role: 'admin', tenant: acme._id },
    { email: 'user@acme.test', role: 'member', tenant: acme._id },
    { email: 'admin@globex.test', role: 'admin', tenant: globex._id },
    { email: 'user@globex.test', role: 'member', tenant: globex._id }
  ];

  for (const u of users) {
    const user = new User({
      email: u.email,
      role: u.role,
      tenant: u.tenant,
      passwordHash: pHash
    })
    await user.save()
    console.log('Created', u.email)
  }

  console.log('Tenants:')
  console.log('Acme id:', acme._id.toString())
  console.log('Globex id:', globex._id.toString())

  console.log('Seeding completed.')
  await mongoose.disconnect()
}

run().catch(err => {
  console.log(err)
  process.exit(1)
})
