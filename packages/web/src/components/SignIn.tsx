import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  AuthError,
} from 'firebase/auth'

import { useState } from 'react'
import { useForm, useFormState } from 'react-hook-form'

import { Spinner } from '@chakra-ui/react'
import { logoTitle, googleSigninButton } from '../assets/Assets'

import firebase from '../FirebaseService'
import { Navigate, useNavigate } from 'react-router-dom'

import { useMutation } from 'react-query'

export type SignInForm = {
  email: string
  password: string
  remember: boolean
}

export function Signin() {
  let display = false
  let [error, setError] = useState('')
  let [isLoading, setLoading] = useState(true)
  let [user, setUser] = useState<User>()
  let navigate = useNavigate()

  const {
    mutateAsync: signInWithPopupAsync,
    isError,
    error: authError,
  } = useMutation<
    UserCredential,
    AuthError,
    { email: string; password: string }
  >(({ email, password }) => {
    return signInWithEmailAndPassword(getAuth(), email, password)
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInForm>()

  // async function handleSignin(data: SignInForm) {
  //   try {
  //     setLoading(true)

  //     // signin and wait for response
  //     const creds = await signInWithEmailAndPassword(
  //       getAuth(),
  //       data.email,
  //       data.password
  //     )

  //     if (!creds || !creds.user)
  //       throw new Error('auth call has internal failure')

  //     if (creds.user.emailVerified) gonext()
  //     else error = 'Email is not verified yet.  Please do so first.'
  //   } catch (e) {
  //     if (e instanceof Error && e.message) error = e.message
  //     else
  //       error =
  //         'Wrong username or password. Try again or click Forgot password to reset it.'
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  async function handleSignin(data: SignInForm) {
    // signin and wait for response
    const creds = await signInWithPopupAsync({
      email: data.email,
      password: data.password,
    })
    console.log(creds)
  }

  async function googleSignin() {
    try {
      // setLoading(true)

      // signin and wait for response
      const creds = await signInWithPopup(getAuth(), new GoogleAuthProvider())
      if (!creds || !creds.user)
        throw new Error('auth call has internal failure')
      if (creds.user.emailVerified) {
        setUser(creds.user)
        gonext()
      } else error = 'Email is not verified yet.  Please do so first.'
    } catch (e) {
      if (e instanceof Error && e.message) error = e.message
      else
        error =
          'Wrong username or password. Try again or click Forgot password to reset it.'
    } finally {
      // setLoading(false)
    }
  }

  function showui() {
    return display
  }

  function gonext() {
    // if (this.$route.query.redirect)
    //   this.$router.replace(<string> this.$route.query.redirect)
    // else
    //   this.$router.replace("/console")
  }

  function created() {
    /*
    if came here due to err, always show dialog
    check if user is already loged in?
      if do, we're done.. move to next route
      if not, show the dialog
    //  */
    // if (!this.$route.query.err) {
    //   if (firebaseService.isLoggedIn()) {
    //     this.display = false
    //     this.gonext()
    //     return
    //   }
    // }
    // this.display = true
    // }
  }

  return (
    <div className="bg-gray-100 h-screen text-gray-800 pt-24 font-raleway">
      {JSON.stringify(authError, null, 2)}
      {JSON.stringify(errors, null, 2)}
      {/* {user && <Navigate to="/" />} */}
      <form
        className="mx-auto w-full sm:max-w-sm"
        onSubmit={handleSubmit(handleSignin)}
      >
        <img className="w-40 mx-auto" src={logoTitle} />

        <h1 className="mt-8 text-4xl text-center leading-loose">Sign In</h1>

        <input
          className="form-input mt-8 w-full text-gray-700 h-16"
          id="username"
          type="email"
          placeholder="Your email"
          required
          {...register('email')}
        />

        <input
          className="form-input mt-4 w-full text-gray-700 h-16"
          id="password"
          type="password"
          required
          placeholder="Your password"
          {...register('password')}
        />

        <p className="text-red-500 text-xs italic py-2">{error}</p>

        <div className="flex mt-2 mb-2 justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register('remember')}
            />
            <span className="ml-2">Remember me</span>
          </label>

          <a
            className="text-blue-600 hover:text-blue-800 text-center"
            href="/console/forgot"
          >
            Reset your password
          </a>
        </div>

        <button
          className="bg-gradient-callout mt-6 h-12 w-full text-2xl text-white rounded-lg focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Sign In
        </button>
      </form>
      <p className="h-8 mt-4 mb-4 text-xl text-gray-800 text-center">Or</p>
      <div className="w-full flex justify-center">
        <button className="w-56" onClick={() => googleSignin()}>
          <img src={googleSigninButton} />
        </button>
      </div>
      <p className="mt-4 text-center text-xl text-gray-600">
        Don't have an account yet?
        <a
          className="text-blue-600 hover:text-blue-800 text-center"
          href="/console/signup"
        >
          Sign up
        </a>
      </p>
      {/* {isLoading && <Spinner />} */}
      {/* <loading :active.sync="isLoading"
             :can-cancel="true" :on-cancel="()=>{isLoading=false}"
             :loader="'dots'" :color="'#1b75be'">
    </loading> */}
    </div>
  )
}
