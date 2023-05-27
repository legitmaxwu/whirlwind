import { type AppProps } from "next/app";
import { type AppType } from "next/dist/shared/lib/utils";
import "~/styles/globals.css";
import { type CustomPage } from "../types/Page";
import { Layout } from "../components/layouts/Layout";

type CustomAppProps = AppProps & {
  Component: CustomPage;
};

const MyApp: AppType = ({ Component, pageProps }: CustomAppProps) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
