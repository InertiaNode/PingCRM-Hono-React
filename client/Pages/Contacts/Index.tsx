import FilterBar from "@/Components/FilterBar/FilterBar";
import Pagination from "@/Components/Pagination/Pagination";
import Table from "@/Components/Table/Table";
import MainLayout from "@/Layouts/MainLayout";
import { Contact, PaginatedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

const Index = () => {
  const { contacts } = usePage<{
    contacts: PaginatedData<Contact>;
  }>().props;

  const {
    data,
    meta: { links },
  } = contacts;

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Contacts</h1>
      <div className="mb-6 flex items-center justify-between">
        <FilterBar />
        <Link className="btn-indigo focus:outline-none" href="/contacts/create">
          <span>Create</span>
          <span className="hidden md:inline"> Contact</span>
        </Link>
      </div>
      <Table
        columns={[
          {
            label: "Name",
            name: "name",
            renderCell: (row) => (
              <>
                {row.name}
                {row.deleted_at && (
                  <Trash2 size={16} className="ml-2 text-gray-400" />
                )}
              </>
            ),
          },
          { label: "Organization", name: "organization.name" },
          { label: "City", name: "city" },
          { label: "Phone", name: "phone", colSpan: 2 },
        ]}
        rows={data}
        getRowDetailsUrl={(row) => `/contacts/${row.id}/edit`}
      />
      <Pagination links={links} />
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Index.layout = (page: React.ReactNode) => (
  <MainLayout title="Contacts" children={page} />
);

export default Index;
