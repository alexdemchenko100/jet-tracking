import { logoTitle } from '../assets/Assets'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  useDisclosure,
  Center,
} from '@chakra-ui/react'
import {
  AuthError,
  getAuth,
  ActionCodeSettings,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  type ForgotParams = {
    email: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotParams>()

  const {
    mutateAsync: forgotPasswordAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
    status,
  } = useMutation<unknown, AuthError, ForgotParams>(
    async (data: ForgotParams) => {
      await firebaseForgotPassword(data.email)
    }
  )

  async function firebaseForgotPassword(email: string) {
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin + '/console/signin',
      handleCodeInApp: true,
    }
    return await sendPasswordResetEmail(getAuth(), email, actionCodeSettings)
  }

  async function handleForgotPassword(data: ForgotParams) {
    await forgotPasswordAsync(data)
  }

  return (
    <div className="bg-gray-100 text-gray-800 h-screen pt-24">
      {isLoading && <Spinner />}
      <img className="w-40 mx-auto" src={logoTitle} />
      <div className="sm:max-w-md mx-auto p-8">
        {isSuccess && <ForgotPasswordSuccess email={''} />}
        {isError && <ForgotPasswordError error={error} />}

        <form
          v-else
          className="flex flex-col items-center
                      justify-center"
          onSubmit={handleSubmit(handleForgotPassword)}
        >
          <h1 className="mt-8 text-4xl text-center leading-loose">
            Reset Your Password
          </h1>
          <input
            type="email"
            required
            className="form-input block w-full mt-4 h-12"
            placeholder="Email"
            {...register('email')}
          />
          <button
            type="submit"
            className="w-full text-center mt-4 py-3 rounded bg-gradient-callout
                         text-white hover:bg-blue-700 focus:outline-none"
          >
            Send Reset Email
          </button>
          <p className="w-full mt-8 text-center text-xl text-gray-600">
            Already have an account?
            <Link
              className="no-underline border-b border-blue text-blue-600 hover:text-blue-800"
              replace={true}
              to="/console/signin"
            >
              &nbsp;Sign in
            </Link>
          </p>
          <p className="w-full text-center text-xl text-gray-600">
            Don't have an account?
            <Link
              className="text-blue-600 hover:text-blue-800 text-center"
              replace={true}
              to="/console/signup"
            >
              &nbsp;Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export function ForgotPasswordSuccess({ email }: { email: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <div className="flex flex-col max-w-6xl px-8 mx-auto items-center justify-around">
            <div className="border mt-4">
              <p className="text-xl">Check your email</p>
              <p className="mt-2">
                We just sent you an email link that allows you to reset your
                password. Please check your Spam folder if email is not found
                within few minutes.
              </p>
            </div>
          </div>
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

export function ForgotPasswordError({ error }: { error: AuthError | null }) {
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
