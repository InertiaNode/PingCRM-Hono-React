import BottomHeader from "@/Components/Header/BottomHeader";
import TopHeader from "@/Components/Header/TopHeader";
import MainMenu from "@/Components/Menu/MainMenu";
import FlashMessages from "@/Components/Messages/FlashMessages";
import { Head } from "@inertiajs/react";

interface MainLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export default function MainLayout({ title, children }: MainLayoutProps) {
  return (
    <>
      <Head title={title} />
      <div className="flex flex-col">
        <div className="flex h-screen flex-col">
          <div className="md:flex">
            <TopHeader />
            <BottomHeader />
          </div>
          <div className="flex flex-grow overflow-hidden">
            <MainMenu className="hidden w-56 flex-shrink-0 overflow-y-auto bg-indigo-800 p-12 md:block" />
            {/**
             * We need to scroll the content of the page, not the whole page.
             * So we need to add `scroll-region="true"` to the div below.
             *
             * [Read more](https://inertiajs.com/pages#scroll-regions)
             */}
            <div
              className="w-full overflow-hidden overflow-y-auto px-4 py-8 md:p-12"
              scroll-region="true"
            >
              <FlashMessages />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
