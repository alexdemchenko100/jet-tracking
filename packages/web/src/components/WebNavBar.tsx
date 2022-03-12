import { logoTitle, heroIllustration } from '../Assets'
import { Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function WebNavBar({ showHero }: { showHero: boolean }) {
  return (
    <div>
      <div
        className={clsx(
          'relative z-50 font-raleway w-full h-14 flex items-center justify-center',
          showHero ? 'text-white' : 'text-gray-900'
        )}
      >
        <div className="flex-shrink-0 px-8 py-4">
          <a href="/">
            <img className="w-56 min-w-full" src={logoTitle} />
          </a>
        </div>
        <div className="invisible md:visible md:w-2/3 flex items-center justify-center">
          <div className="flex-1 flex items-center justify-center">
            <Link to="/product" className="hover:text-gray-400 px-4">
              Product
            </Link>
            <Link to="/pricing" className="hover:text-gray-400 px-4">
              Pricing
            </Link>
            <Link to="/services" className="hover:text-gray-400 px-4">
              Services
            </Link>
            <a href="/docs/index.html" className="hover:text-gray-400 px-4">
              Docs
            </a>
            <Link to="/about" className="hover:text-gray-400 px-4">
              About
            </Link>
          </div>
          <div className="flex items-center justify-end">
            <Link to="/console/signin" className="hover:text-gray-400 px-4">
              Sign in
            </Link>
            <Link to="/console/signup" className="text-black px-4">
              <Button
                className={clsx(
                  'rounded-lg p-2 mr-4',
                  showHero ? 'bg-white' : 'bg-blue-200'
                )}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <img
        v-if="show_hero"
        className="absolute right-0 top-0 w-full md:w-2/3"
        src={heroIllustration}
      />
    </div>
  )
}
