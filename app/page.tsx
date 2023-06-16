"use client"
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
// import { Dialog } from '@headlessui/react'
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { listDataCollections, duplicateDataCollection } from "./server-function"
import type { collections } from "@wix/data"

const navigation: { name: string; href: string; }[] = []
export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [userInfo, setUserInfo] = useState({ apiKey: "", siteId: "" })
  const [listDataCollectionsResponse, setListDataCollectionsResponse] = useState<collections.ListDataCollectionsResponse>()


  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey")
    const siteId = localStorage.getItem("siteId")
    if (!apiKey || !siteId) return;
    setUserInfo({ apiKey, siteId })
  }, [])

  useEffect(() => {
    if (!userInfo.apiKey || !userInfo.siteId) return;
    localStorage.setItem("apiKey", userInfo.apiKey)
    localStorage.setItem("siteId", userInfo.siteId)
  }, [userInfo])

  const getListDataCollections = async () => {
    try {
      setProcessing(true)
      const c = await listDataCollections(userInfo)
      console.log(c)
      setListDataCollectionsResponse(c)
    } catch (error) {
      console.error(error)
      alert("Error getting collections")
    }
    setProcessing(false)
  }

  const duplicateCollection = async (dataCollectionId: string | undefined) => {
    if (!dataCollectionId) return;
    try {
      setProcessing(true)
      await duplicateDataCollection({ ...userInfo, dataCollectionId })
      await getListDataCollections()
      setProcessing(false)
      alert("Collection duplicated")
    } catch (error) {
      console.error(error)
      alert("Error duplicating collection")
    }

  }

  return (
    <>
      <Transition.Root show={processing} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => { }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg px-4 pb-4 pt-5 text-left transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <ArrowPathIcon className="animate-spin h-6 w-6 text-gray-600" aria-hidden="true" />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="bg-white min-h-screen">
        {/* <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header> */}

        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {"'"}wix-data{"'"} Client
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                You can perform various operations on your collection using an API Keys.
              </p>
              <div className="flex items-center justify-end gap-x-6">
                <a href="https://dev.wix.com/api/rest/getting-started/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more about API Keys<span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div className="mt-10 isolate -space-y-px rounded-md shadow-sm">
              <div className="relative rounded-md rounded-b-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="api-key" className="block text-xs font-medium text-gray-900">
                  API Key(Require permission: Wix Data)
                </label>
                <input
                  type="text"
                  name="api-key"
                  id="api-key"
                  value={userInfo.apiKey}
                  onChange={(e) => { setUserInfo({ ...userInfo, apiKey: e.target.value }) }}
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="xxx"
                />
              </div>
              <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="site-id" className="block text-xs font-medium text-gray-900">
                  Site ID
                </label>
                <input
                  type="text"
                  name="site-id"
                  id="site-id"
                  value={userInfo.siteId}
                  onChange={(e) => { setUserInfo({ ...userInfo, siteId: e.target.value }) }}
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="xxx"
                />
              </div>
            </div>
            <div className='flex justify-end'>
              <button
                onClick={getListDataCollections}
                type="button"
                className="mt-3 rounded bg-indigo-600 px-2 py-1 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </button>
            </div>



            <ul role="list" className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(listDataCollectionsResponse?.collections || [])
                .filter(c => c.collectionType === 'NATIVE')
                .map((collection) => (
                  <li key={collection._id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-sm font-medium text-gray-900">{collection.displayName}</h3>
                          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {collection.collectionType}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-gray-500">{collection._id}</p>
                      </div>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <button
                            onClick={() => duplicateCollection(collection._id)}
                            className={`relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 ${collection.collectionType !== 'NATIVE' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={collection.collectionType !== 'NATIVE'}
                            title={collection.collectionType !== 'NATIVE' ? 'Only Native Collection can be duplicated' : ''}
                          >
                            Duplicate
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>

        </div>
      </div></>
  )
}
