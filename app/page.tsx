"use client"
import dynamic from 'next/dynamic'
const ReactEmbedGist = dynamic(() => import("react-embed-gist"), {
  ssr: false,
});
import { Parser } from 'node-sql-parser';
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
// import { Dialog } from '@headlessui/react'
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { collections } from "@wix/data"

const sqlParser = new Parser();

const navigation: { name: string; href: string; }[] = []

const copyTextToClipboard = (textVal: string): void => {
  const copyFrom = document.createElement("textarea");
  copyFrom.textContent = textVal;
  const bodyElm = document.getElementsByTagName("body")[0];
  bodyElm.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  bodyElm.removeChild(copyFrom);
};

const getCollectionStructures = (c: collections.ListDataCollectionsResponse) => {
  const collectionStructures = c.collections?.map((c) => ({
    tableName: c._id,
    columns: c.fields?.map((f) => ({ name: f.key, type: f.type })),
  }))
  return collectionStructures;
}


export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [mode, setMode] = useState<"sql" | "natural">("natural")

  const [sqlStr, setSqlStr] = useState<string>("")
  const [sqlResult, setSqlResult] = useState<{
    columns: string[],
    rows: { [key: string]: string }[]
  }>()
  const [userInfo, setUserInfo] = useState({ apiKey: "", siteId: "", sqlEndPoint: "" })
  const [listDataCollectionsResponse, setListDataCollectionsResponse] = useState<collections.ListDataCollectionsResponse>()


  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey")
    const siteId = localStorage.getItem("siteId")
    const sqlEndPoint = localStorage.getItem("sqlEndPoint") || ""
    if (!apiKey || !siteId) return;
    setUserInfo({ apiKey, siteId, sqlEndPoint })
  }, [])

  useEffect(() => {
    if (!userInfo.apiKey || !userInfo.siteId) return;
    localStorage.setItem("apiKey", userInfo.apiKey)
    localStorage.setItem("siteId", userInfo.siteId)
    localStorage.setItem("sqlEndPoint", userInfo.sqlEndPoint || "")
  }, [userInfo])

  useEffect(() => {
    if (!sqlStr) {
      setMode("natural")
      return;
    }
    try {
      sqlParser.astify(sqlStr)
      setMode("sql")
    } catch (error: any) {
      if (error.name === "SyntaxError" && error.found === "/") {
        setMode("sql")
      } else {
        setMode("natural")
      }
    }
  }, [sqlStr])

  const getListDataCollections = async () => {
    try {
      setProcessing(true)
      const c = await fetch("/api/listDataCollections",
        {
          cache: "no-cache",
          headers: { "x-wix-site-id": userInfo.siteId, "x-wix-api-key": userInfo.apiKey }
        }).then(res => res.json() as collections.ListDataCollectionsResponse);
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

      await fetch("/api/duplicateDataCollection", {
        method: "POST",
        cache: "no-cache",
        headers: { "x-wix-site-id": userInfo.siteId, "x-wix-api-key": userInfo.apiKey },
        body: JSON.stringify({ dataCollectionId })
      }).then(res => res.json());

      await getListDataCollections()
      setProcessing(false)
      alert("Collection duplicated")
    } catch (error) {
      console.error(error)
      alert("Error duplicating collection")
    }
  }

  const execSql = async (sql?: string) => {
    setProcessing(true)
    try {
      const { columns, rows } = await fetch("/api/sql", {
        method: "POST",
        cache: "no-cache",
        body: JSON.stringify({ sqlEndPoint: userInfo.sqlEndPoint, sqlStr: sql || sqlStr })
      })
        .then(res => res.json())
        .then(res => {
          const { columns, rows } = res.result.payload.data;
          return { columns, rows }
        });

      if (rows.length === 0) {
        alert("No results")
      }

      setSqlResult({ columns, rows })
      console.log({ columns, rows })

    } catch (error) {
      console.error(error)
      alert("Error running query")
    }
    setProcessing(false)
  }

  const getSqlFromNaturalLanguage = async () => {
    setProcessing(true)
    try {
      const { message } = await fetch("/api/gpt", {
        method: "POST",
        cache: "no-cache",
        body: JSON.stringify({
          content: `${sqlStr}
---
Additional information:
- There are 4 main operators supported : SELECT, INSERT INTO, UPDATE, DELETE. 
- There are 4 additional operators supported : WHERE, LIMIT, ORDER BY, JOIN.
${listDataCollectionsResponse ? "- Table info\n" + JSON.stringify(getCollectionStructures(listDataCollectionsResponse)) : ""}
` })
      })
        .then(res => res.json());

      setSqlStr(message.content)
      await execSql(message.content)


    } catch (error) {
      console.error(error)
      alert("Error running ai query")
    }
    setProcessing(false)
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

        <div className="relative isolate px-6 pt-14 lg:px-8 py-32 sm:py-48 lg:py-56">
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
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {"'"}wix-data{"'"} Client
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                You can perform various operations on your collection using an API Keys.
              </p>
              <div className="flex items-center justify-end gap-x-6">
                <a href="https://dev.wix.com/api/rest/getting-started/api-keys#getting-started_api-keys_about-api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more about API Keys<span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="flex items-center justify-end gap-x-6">
                <a href="https://dev.wix.com/api/rest/getting-started/api-keys#getting-started_api-keys_create-and-use-api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more about Site ID<span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="flex items-center justify-end gap-x-6">
                <a href="#sql-endpoint"
                  className="text-sm font-semibold leading-6 text-gray-900">
                  Learn more about SQL Endpoint<span aria-hidden="true">→</span>
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
              <div className="relative rounded-md rounded-t-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-indigo-600">
                <label htmlFor="sql-endpoint-input" className="block text-xs font-medium text-gray-900">
                  SQL Endpoint (optional, advanced)
                </label>
                <input
                  type="text"
                  name="sql-endpoint-input"
                  id="sql-endpoint-input"
                  value={userInfo.sqlEndPoint}
                  onChange={(e) => { setUserInfo({ ...userInfo, sqlEndPoint: e.target.value }) }}
                  className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="xxx"
                />
              </div>
            </div>
            <div className='flex justify-end'>
              <button
                onClick={getListDataCollections}
                type="button"
                disabled={userInfo.apiKey === '' || userInfo.siteId === ''}
                title={userInfo.apiKey === '' || userInfo.siteId === '' ? 'Please enter your API Key and Site ID' : ''}
                className={
                  `mt-3 rounded bg-indigo-600 px-2 py-1 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed`
                }
              >
                Get Started
              </button>
            </div>

            {userInfo.sqlEndPoint && listDataCollectionsResponse && listDataCollectionsResponse.collections && (
              <div className="mt-10 flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <form className="relative">
                    <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                      <label htmlFor="comment" className="sr-only">
                        Add your sql
                      </label>
                      <textarea
                        // cmd + enter = submit
                        onKeyDown={(e) => {
                          if (e.keyCode === 13 && e.metaKey) {
                            e.preventDefault();
                            mode === 'sql' ? execSql() : getSqlFromNaturalLanguage();
                          }
                        }}
                        rows={3}
                        name="sql"
                        id="sql"
                        className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder={mode === 'sql' ? 'Enter your SQL' : 'Enter your natural language'}
                        value={sqlStr}
                        onChange={(e) => { setSqlStr(e.target.value) }}
                      />

                      {/* Spacer element to match the height of the toolbar */}
                      <div className="py-2" aria-hidden="true">
                        {/* Matches height of button in toolbar (1px border + 36px content height) */}
                        <div className="py-px">
                          <div className="h-9" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                      <div className="flex items-center space-x-5">


                      </div>
                      <div className="flex-shrink-0">
                        {mode === 'sql' ? <button
                          onClick={(e) => {
                            e.preventDefault();
                            execSql();
                          }}
                          className="mr-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Exec SQL
                        </button> : <button
                          onClick={(e) => {
                            e.preventDefault();
                            getSqlFromNaturalLanguage();
                          }}
                          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Exec SQL from Natural Language
                        </button>}


                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr className="divide-x divide-gray-200">
                          {sqlResult?.columns?.map((col, i) => (
                            <th key={i} scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sqlResult?.rows?.map((row, index) => {
                          return <tr
                            key={String(index)}
                            className="divide-x divide-gray-200">
                            {sqlResult?.columns?.map((col, index2) => (
                              <td key={String(row[col]) + index + index2} className="flex-1 max-w-sm truncate px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        })}


                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <ul role="list" className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(listDataCollectionsResponse?.collections || [])
                // .filter(c => c.collectionType === 'NATIVE')
                .map((collection) => (
                  <li key={collection._id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-sm font-medium text-gray-900" title={`${collection.displayName}(ID: ${collection._id})`}>
                            {collection.displayName}(ID: {collection._id})
                          </h3>
                          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {collection.collectionType}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-gray-500" title={
                          collection.fields?.map(f => f.key).join(', ')
                        }>
                          field key: {collection.fields?.map(f => f.key).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <button
                            onClick={() => {
                              window.open(`https://manage.editorx.com/dashboard/${userInfo.siteId}/database/data/${encodeURIComponent(collection._id!)}`)
                            }}
                            className={`relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 cursor-pointer`}
                          >
                            Open
                          </button>
                        </div>
                        <div className="flex w-0 flex-1">
                          <button
                            onClick={() => {
                              copyTextToClipboard(collection._id!)
                              alert('Copied!')
                            }}
                            className={`relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900 cursor-pointer`}
                          >
                            Copy Collection ID
                          </button>
                        </div>
                        <div className="flex w-0 flex-1">
                          <button
                            onClick={() => {
                              if (collection.collectionType === 'NATIVE' && window.confirm('Are you sure you want to duplicate this collection?')) {
                                duplicateCollection(collection._id)
                              }
                            }}
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



          <div className="mt-10 relative isolate overflow-hidden bg-white px-6 lg:overflow-visible lg:px-0">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
              <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                <div id="sql-endpoint" className="lg:pr-4">
                  <div className="lg:max-w-lg">
                    <p className="text-base font-semibold leading-7 text-indigo-600">{'@velo/wix-data-sql-backend'}</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">SQL Endpoint</h2>
                    <p className="my-6 text-xl leading-8 text-gray-700">
                      {/*  */}
                      Please install the Velo Packages <a
                        className='underline text-blue-600 hover:text-blue-700'

                        href="https://www.wix.com/velo/reference/velo-package-readmes/sql-package"
                        target='_blank'
                        rel="noreferrer"
                      >
                        {"'@velo/wix-data-sql-backend'"}
                      </a>, and copy the code below to expose a function called <span
                        className='font-mono text-purple-600'
                      >
                        post_sql
                      </span> as an <a
                        className='underline text-blue-600 hover:text-blue-700'
                        href="https://support.wix.com/en/article/velo-exposing-a-site-api-with-http-functions"
                        target='_blank'
                        rel="noreferrer"
                      >
                        HTTP Functions</a> function.
                    </p>
                    <ReactEmbedGist gist="hand-dot/43d6c60b5e704ec01764caafa364a87c" />


                    <p className="mt-6 text-xl leading-8 text-gray-700">
                      After that, you can set the <span
                        className='font-mono text-purple-600'
                      >
                        https://your.domain.com/_functions/sql
                      </span> as SQL Endpoint.

                      This endpoint will be used to execute SQL queries.
                    </p>
                    <p
                      className="mt-6 text-xl leading-8 text-red-700"
                    >
                      *Please be cautious when using this, as it may lower the security level.
                    </p>
                  </div>
                </div>
              </div>
              <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                  src="https://github.com/hand-dot/wix-data-client/assets/24843808/e04cf359-df51-4897-98a9-05688932186a"
                  alt="post_sql"
                />
              </div>
            </div>
          </div>


        </div>



      </div>
    </>
  )
}
