import {
  bars,
  blueDotGrid,
  rockyCloud,
  rightArrowPointer,
  grarGrid,
  shield,
  monitor,
  questionMark,
  speedometer,
  cloud,
  consolePic,
} from './Assets'

import { WebNavBar } from './components/WebNavBar'
import { WebFooter } from './components/WebFooter'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="home min-h-screen font-raleway relative">
      <WebNavBar showHero={true} />

      <div className="flex items-start justify-start pl-8 pt-20 z-20">
        <img className="w-16" src={grarGrid} />
        <div className="flex flex-col ">
          <p className="pl-4 text-3xl text-gray-600">
            Automated API and Browser monitoring
            <br />
            to keep you on <span className="font-semibold">top and relax</span>
          </p>
          <p className="pl-4 pt-4 w-2/5 text-gray-600 mb-4">
            Monitor your APIs, web sites and applications seemlessly. We monitor
            relentlessly and let you know when behaviour is not as expected
          </p>
          <div className="flex mt-4 items-begin pl-4">
            <Link to="/console/signup">
              <button className="bg-gradient-callout w-48 rounded-lg p-2 red">
                Get Started Now
              </button>
            </Link>
            <a href="/docs/index.html">
              <button className="bg-gray-300 w-48 rounded-lg p-2 ml-8">
                Documentation
              </button>
            </a>
          </div>
        </div>
      </div>
      <img className="-ml-56 absolute z-0" src={rockyCloud} />
      <p className="ml-24 pl-4 text-3xl pt-48 text-gray-700 relative z-50">
        Key <span className="font-semibold">Advantages</span>
      </p>
      <div className="mt-24 ml-48 flex flex-wrap">
        {/*  Dashboard  */}
        <div className="m-10 w-1/3">
          <div className="flex items-start justify-center">
            <div className="flex-shrink-0 flex align-middle items-center justify-center rounded-full bg-blue-100 w-10 h-10">
              <img className="w-6 h-6" src={bars} />
            </div>
            <div className="ml-4 flex flex-col items-begin justify-start">
              <p className="text-2xl text-blue-600">Powerful Console</p>
              <p className="text-gray-600">
                Web UI allows for easy management. Create new MQTT servers, add
                users, enable authorizations. Server status details
              </p>
            </div>
          </div>
        </div>
        {/*  Secure  */}
        <div className="m-10 w-1/3">
          <div className="flex items-start justify-center">
            <div className="flex-shrink-0 flex align-middle items-center justify-center rounded-full bg-green-100 w-10 h-10">
              <img className="w-6 h-6" src={shield} />
            </div>
            <div className="ml-4 flex flex-col items-begin justify-start">
              <p className="text-2xl text-green-600">Secure</p>
              <p className="text-gray-600">
                TLS secured connections with public key server identity.
                Password based user identity and ACL based topic authorizations
              </p>
            </div>
          </div>
        </div>
        {/*  Speed  */}
        <div className="m-10 w-1/3">
          <div className="flex items-start justify-center">
            <div className="flex-shrink-0 flex align-middle items-center justify-center rounded-full bg-red-100 w-10 h-10">
              <img className="w-6 h-6" src={speedometer} />
            </div>
            <div className="ml-4 flex flex-col items-begin justify-start">
              <p className="text-2xl text-red-600">Secure</p>
              <p className="text-gray-600">
                Bring up a server in less than 2 minutes. Fully functional and
                ready from the get go
              </p>
            </div>
          </div>
        </div>
        {/*  Monitoring  */}
        <div className="m-10 w-1/3">
          <div className="flex items-start justify-center">
            <div className="flex-shrink-0 flex align-middle items-center justify-center rounded-full bg-orange-100 w-10 h-10">
              <img className="w-6 h-6" src={monitor} />
            </div>
            <div className="ml-4 flex flex-col items-begin justify-start">
              <p className="text-2xl text-orange-600">Monitoring</p>
              <p className="text-gray-600">
                Monitor status of your server. 24/7 monitoring for issues{' '}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        {/* showcase rectangle grid */}
        <div className="relative w-1/2 h-64 rounded-xl bg-blue-400 -ml-32 z-20">
          {/* white dots */}
          <img
            className="absolute mt-8 mr-8 top-0 right-0"
            src="../assets/whitedots_grid.png"
          />
          {/* console picture */}
          <img className="ml-48 pt-24" src={consolePic} />
        </div>
        <div className="mt-32 bg-gray-200 w-2/3 h-64 z-0 flex items-center justify-center">
          <div className="flex flex-col items-start content-start w-1/3">
            <p className="text-2xl">
              About <span className="font-semibold">Product</span>
            </p>
            <p className="mt-2 text-gray-600">
              TLS secured connections with public key server identity. Password
              based user identity and ACL based topic authorizations
            </p>
            <a href="/docs/promqtt.html">
              <p className="mt-4 text-sm text-red-600">
                <img className="inline" src={rightArrowPointer} /> Learn more
              </p>
            </a>
          </div>
        </div>
      </div>
      {/* cloud edu*/}
      <div className="relative mt-64 w-2/3 h-64 mx-auto">
        <img className="absolute z-0" src={cloud} />
        <div className="flex items-center justify-center relative z-20 pt-8">
          <img src={blueDotGrid} />
          <img className="ml-6" src={questionMark} />
          <p className="ml-6 text-xl text-gray-600">
            New to <span className="font-semibold">MQTT Brokers?</span>
            <br />
            <br />
            <span>
              MQTT is the protocol of choice for connecting IoT devices to the
              internet. It has a number of advantages compared to HTTP in
              operating in a constrained environment and efficiently using
              limited bandwidth.
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-start">
        <div className="mx-auto flex items-center justify-start mt-24 w-1/2 h-16 bg-gray-200">
          <p className="ml-4">What is MQTT?</p>
        </div>
        <p className="ml-12 mt-4 w-2/5 text-sm text-gray-600">
          MQTT is the protocol of choice for connecting IoT devices to the
          internet. It has a number of advantages compared to HTTP in operating
          in a onstrained environment and efficiently using limited bandwidth.
          <br />
          <br />
          The protocol is designed by IBM researchers for connecting small
          devices to the internet. All messages are binary and use a small
          message header. When compared to HTTP, MQTT messages are much smaller.
          It is also designed towards maintaining long lived persistent
          connections unlike HTTP, which helps in real time bidirectional
          communication. It also amortizes expensive but mandatory handshake in
          establishing secure connections.
        </p>
      </div>
      <div className="mt-12">
        <WebFooter></WebFooter>
      </div>
    </div>
  )
}
