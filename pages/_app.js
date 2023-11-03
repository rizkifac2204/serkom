import Head from "next/head";
import Layout from "components/Layout/Layout";
import PublicLayout from "components/Layout/PublicLayout";
import "../styles/globals.css";
import "react-perfect-scrollbar/dist/css/styles.css";

// Toast dibutuhkan pada semua halaman termasuk saat logout
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Progess dibutuhkan pada semua halaman termasuk saat logout
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Router berjalan termasuk saat logout
import Router from "next/router";
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

import { ContextProvider } from "context";
import { AuthContextProvider } from "context/AuthContext";

// Tanstack
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

import { WhatsappContextProvider } from "context/whatsappContext";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>PPID</title>
      </Head>
      <ToastContainer />
      <noscript>Browser Anda Tidak Mendukung Javascript</noscript>
      <WhatsappContextProvider>
        <QueryClientProvider client={queryClient}>
          {Component.auth ? (
            <AuthContextProvider>
              <ContextProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ContextProvider>
            </AuthContextProvider>
          ) : (
            <>
              {Component.public ? (
                <PublicLayout>
                  <Component {...pageProps} />
                </PublicLayout>
              ) : (
                <Component {...pageProps} />
              )}
            </>
          )}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WhatsappContextProvider>
    </>
  );
}

export default MyApp;
