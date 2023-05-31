import { type AppProps } from "next/app";
import { type AppType } from "next/dist/shared/lib/utils";
import "~/styles/globals.css";
import { type CustomPage } from "../types/Page";
import { Layout } from "../components/layouts/Layout";
import { useViewportSize } from "@mantine/hooks";
import Image from "next/image";
type CustomAppProps = AppProps & {
  Component: CustomPage;
};

const MyApp: AppType = ({ Component, pageProps }: CustomAppProps) => {
  const getLayout = Component.getLayout || ((page) => page);

  const { width } = useViewportSize();

  if (width < 1200) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center px-4">
        <Image
          src="/whirlwind-logo-black.png"
          alt="Whirlwind Logo"
          width={200}
          height={1}
          // className="flex-1"
        />
        <div className="h-4"></div>
        <div className="max-w-sm text-center">
          This demo is only available for screens wider than 1200px. Your
          viewport is {width}px. Thanks {":)"}
        </div>
      </div>
    );
  }

  return <Layout>{getLayout(<Component {...pageProps} />)}</Layout>;
};

export default MyApp;
