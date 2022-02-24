import {
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'

import {
  ActionCodeSettings,
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Link } from 'react-router-dom'

import { logoTitle } from '../assets/Assets'

type SignUpParams = {
  fullName: string
  email: string
  password: string
}

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpParams>()

  const {
    mutateAsync: signupAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
    status,
  } = useMutation<UserCredential, AuthError, SignUpParams>(
    async (data: SignUpParams) => {
      return await firebaseSignup(data)
    }
  )

  async function firebaseSignup({ fullName, email, password }: SignUpParams) {
    let creds = await createUserWithEmailAndPassword(getAuth(), email, password)
    await updateProfile(creds.user, { displayName: fullName })
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin + '/console/signin',
      handleCodeInApp: true,
    }
    await sendEmailVerification(creds.user, actionCodeSettings)
    return creds
  }

  async function handleSignUp(data: SignUpParams) {
    // signin and wait for response
    await signupAsync(data)
  }

  return (
    <div className="bg-gray-100 h-screen pt-24">
      {isLoading && <Spinner />}
      {isSuccess && <SignUpSuccess email={data?.user.email ?? ''} />}
      {isError && <SignUpError error={error} />}

      <div className="w-full sm:max-w-md mx-auto">
        <form
          className="mx-auto w-full sm:max-w-sm"
          onSubmit={handleSubmit(handleSignUp)}
        >
          <img className="w-40 mx-auto" src={logoTitle} />
          <h1 className="mt-8 text-4xl text-center leading-loose">
            Create Account
          </h1>
          <input
            type="text"
            required
            className="form-input block w-full h-16"
            placeholder="Your full name"
            {...register('fullName')}
          />
          <input
            type="email"
            required
            className="form-input block w-full h-16 mt-4"
            placeholder="you@company.com"
            {...register('email')}
          />
          <input
            type="password"
            required
            className="form-input block w-full h-16 mt-4"
            placeholder="Enter a strong password"
            {...register('password')}
          />
          {/* <input
            type="password"
            required
            className="form-input block w-full h-16 mt-4"
            placeholder="Confirm Password"
            {...register('password')}
          /> */}
          <button
            type="submit"
            className="w-full text-xl text-center mt-4 py-3 rounded bg-gradient-callout text-white focus:outline-none"
          >
            Create Account
          </button>
          <div className="text-center text-sm text-gray-600 mt-4">
            By signing up, you agree to the <br />
            <a
              className="no-underline border-b bg-gray-100 text-gray-600"
              href="/docs/terms-of-service.html"
            >
              Terms of Service
            </a>
            &nbsp;and&nbsp;
            <a
              className="no-underline border-b bg-gray-100 text-gray-600"
              href="/docs/privacy-policy.html"
            >
              Privacy Policy
            </a>
          </div>
          <div className=" text-xl text-center text-gray-600 mt-6">
            Already have an account?
            <Link
              className="text-blue-600 hover:text-blue-800 border-b border-blue text-blue"
              to="/console/signin"
            >
              &nbsp;Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export function SignUpSuccess({ email }: { email: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <h1 className="mb-8 text-2xl text-center">
            Please verify your email
          </h1>
          <p>
            You are almost there. We sent an email to <br />
            <strong>{email}</strong>
            <br />
            <br />
            Just click on the link provided in the email to complete your
            signup. If you don't see the email, you may need to check{' '}
            <strong>your spam folder</strong>
            <br />
          </p>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function SignUpError({ error }: { error: AuthError | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <div className="flex flex-col max-w-6xl px-8 mx-auto items-center justify-around h-64">
              <div className="text-xl">
                <p>
                  Signup failed <br />
                  {error && JSON.stringify(error, null, 2)}
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Center>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </Center>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
