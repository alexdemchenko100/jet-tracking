import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  AuthError,
} from 'firebase/auth'

import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

import { Spinner } from '@chakra-ui/react'
import { Link, Navigate } from 'react-router-dom'

import store from '../services/Store'
import { logoTitle, googleSigninButton } from '../Assets'

export type SignInForm = {
  email: string
  password: string
  remember: boolean
}

export function SignIn() {
  let userInfo = store.watch(store.user)

  const {
    mutateAsync: signInAsync,
    isLoading,
    error,
  } = useMutation<UserCredential, AuthError, SignInForm | undefined>(async (data?: SignInForm) => {
    let creds
    try {
      if (!data) {
        creds = await signInWithPopup(getAuth(), new GoogleAuthProvider())
      } else {
        creds = await signInWithEmailAndPassword(getAuth(), data.email, data.password)
      }
    } catch (e) {
      console.error(e)
    }
    if (!creds || !creds.user || !creds.user.emailVerified)
      throw new Error('auth call has internal failure')

    store.user.user = creds.user
    store.user.isLoggedIn = creds.user && creds.user.emailVerified

    return creds
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInForm>()

  async function handleSignIn(data?: SignInForm) {
    // login and wait for response
    await signInAsync(data)
  }

  if (userInfo.isLoggedIn) {
    return <Navigate to='/' />
  }

  return (
    <div className='bg-gray-100 h-screen text-gray-800 pt-24 font-raleway'>
      {isLoading && <Spinner />}
      <form className='mx-auto w-full sm:max-w-sm' onSubmit={handleSubmit(handleSignIn)}>
        <img className='w-40 mx-auto' src={logoTitle} />

        <h1 className='mt-8 text-4xl text-center leading-loose'>Sign in</h1>

        <input
          className='form-input mt-8 w-full text-gray-700 h-16'
          id='username'
          type='email'
          placeholder='Your email'
          required
          {...register('email')}
        />

        <input
          className='form-input mt-4 w-full text-gray-700 h-16'
          id='password'
          type='password'
          required
          placeholder='Your password'
          {...register('password')}
        />

        <p className='text-red-500 text-xs italic py-2'>{JSON.stringify(error, null, 2)}</p>

        <div className='flex mt-2 mb-2 justify-between'>
          <label className='flex items-center'>
            <input type='checkbox' className='form-checkbox' {...register('remember')} />
            <span className='ml-2'>Remember me</span>
          </label>

          <Link className='text-blue-600 hover:text-blue-800 text-center' to='/console/forgot'>
            Forgot your password?
          </Link>
        </div>

        <button
          className='bg-gradient-callout mt-6 h-12 w-full text-2xl text-white rounded-lg focus:outline-none focus:shadow-outline'
          type='submit'
        >
          Sign in
        </button>
      </form>
      <p className='h-8 mt-4 mb-4 text-xl text-gray-800 text-center'>Or</p>
      <div className='w-full flex justify-center'>
        <button className='w-56' onClick={() => handleSignIn()}>
          <img src={googleSigninButton} />
        </button>
      </div>
      <p className='mt-4 text-center text-xl text-gray-600'>
        Don't have an account yet?
        <Link className='text-blue-600 hover:text-blue-800 text-center' to='/console/signup'>
          &nbsp;Sign up
        </Link>
      </p>
    </div>
  )
}
