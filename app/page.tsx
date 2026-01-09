"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { authClient } from "@/lib/auth-client";

const Home = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const {
    data: session
  } = authClient.useSession()

  const onSubmit = () => {
    authClient.signUp.email({
      name,
      email,
      password
    },
      {
        onRequest: () => {
          //show loading
          alert("Registering user...");
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          alert("User registered successfully!");
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        }
      });
  }

  const onLogin = () => {
    authClient.signIn.email({
      email,
      password
    },
      {
        onRequest: () => {
          //show loading
          alert("Logging in user...");
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          alert("User logged in successfully!");
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        }
      });
  }

  if (session) {
    return (
      <div className='text-center mt-20'>
        <h1>Welcome, {session.user.name}</h1>
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
      </div>
    )
  }
  return (
    <div>
      <div className='flex flex-col gap-4'>
        <Input placeholder='name' value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={onSubmit}>Sign Up</Button>
      </div>
      <div className='flex flex-col gap-4'>
        <Input placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={onLogin}>Login</Button>
      </div>
    </div>
  )
}

export default Home
