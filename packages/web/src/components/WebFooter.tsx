import { Link } from 'react-router-dom'

import { location, email, logoTitleDark } from '../Assets'

export function WebFooter() {
  return (
    <div className="w-full font-raleway ">
      {/* Call for Action  */}
      <div className="w-full bg-gradient-callout py-10 text-white flex justify-around mx-auto">
        <div>
          <span className="px-4 text-3xl font-light">
            Free up time for your{' '}
            <span className="font-semibold">core value generation</span>
          </span>
        </div>
        <Link to="/console/signup">
          <button className="bg-white rounded-lg text-black text-2xl px-6 py-2">
            Get Started
          </button>
        </Link>
      </div>
      <div className="w-full bg-slate py-10 mx-auto flex items-center justify-center text-white">
        <div className="m-8">
          <img src={logoTitleDark} className="src" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Link to="/" className="hover:text-gray-600 px-4">
            Home
          </Link>
          <Link to="/products" className="hover:text-gray-600 px-4">
            Products
          </Link>
          <Link to="/services" className="hover:text-gray-600 px-4">
            Services
          </Link>
          <a href="/docs/index.html" className="hover:text-gray-600 px-4">
            Documentation
          </a>
          <Link to="/pricing" className="hover:text-gray-600 px-4">
            Pricing
          </Link>
          <Link to="/about" className="hover:text-gray-600 px-4">
            About
          </Link>
        </div>
        <div className="flex flex-col justify-start m-4">
          <div className="flex">
            <img src={email} />
            <a
              className="px-2 hover:text-gray-600"
              href="mailto:support@proautoma.com"
            >
              support@proautoma.com
            </a>
          </div>
          <div className="flex">
            <img src={location} />
            <p className="px-2 opacity-75">San Diego, CA, USA</p>
          </div>
        </div>
      </div>
      <div className="w-full bg-darkslate text-gray-600 text-sm py-8">
        <div className="flex items-center justify-center">
          <span>Copyright © 2020 ProAutoma LLC. All rights reserved</span>
          <span className="px-4">|</span>
          <a href="/docs/terms-of-service.html">Terms of Service</a>
          <span className="px-4">|</span>
          <a href="/docs/privacy-policy.html">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
