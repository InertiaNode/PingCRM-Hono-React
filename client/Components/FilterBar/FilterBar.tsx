import FieldGroup from "@/Components/Form/FieldGroup";
import SelectInput from "@/Components/Form/SelectInput";
import TextInput from "@/Components/Form/TextInput";
import { router, usePage } from "@inertiajs/react";
import pickBy from "lodash/pickBy";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrevious } from "react-use";

export default function FilterBar() {
  const { filters } = usePage<{
    filters: { role?: string; search?: string; trashed?: string };
  }>().props;

  const [opened, setOpened] = useState(false);

  const [values, setValues] = useState({
    role: filters.role || "", // role is used only on users page
    search: filters.search || "",
    trashed: filters.trashed || "",
  });

  const prevValues = usePrevious(values);

  function reset() {
    setValues({
      role: "",
      search: "",
      trashed: "",
    });
  }

  useEffect(() => {
    // https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
    if (prevValues) {
      const query = Object.keys(pickBy(values)).length ? pickBy(values) : {};

      router.get(window.location.pathname, query, {
        replace: true,
        preserveState: true,
      });
    }
  }, [values, prevValues]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const name = e.target.name;
    const value = e.target.value;

    setValues((values) => ({
      ...values,
      [name]: value,
    }));

    if (opened) setOpened(false);
  }

  return (
    <div className="mr-4 flex w-full max-w-md items-center">
      <div className="relative flex rounded bg-white shadow">
        <div
          style={{ top: "100%" }}
          className={`absolute ${opened ? "" : "hidden"}`}
        >
          <div
            onClick={() => setOpened(false)}
            className="fixed inset-0 z-20 bg-black opacity-25"
          />
          <div className="relative z-30 mt-2 w-64 space-y-4 rounded bg-white px-4 py-6 shadow-lg">
            {Object.keys(filters).includes("role") && (
              <FieldGroup label="Role" name="role">
                <SelectInput
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "" },
                    { value: "user", label: "User" },
                    { value: "owner", label: "Owner" },
                  ]}
                />
              </FieldGroup>
            )}
            <FieldGroup label="Trashed" name="trashed">
              <SelectInput
                name="trashed"
                value={values.trashed}
                onChange={handleChange}
                options={[
                  { value: "", label: "" },
                  { value: "with", label: "With Trashed" },
                  { value: "only", label: "Only Trashed" },
                ]}
              />
            </FieldGroup>
          </div>
        </div>
        <button
          onClick={() => setOpened(true)}
          className="rounded-l border-r px-4 hover:bg-gray-100 focus:z-10 focus:border-white focus:ring-2 focus:ring-indigo-400 focus:outline-none md:px-6"
        >
          <div className="flex items-center">
            <span className="hidden text-gray-700 md:inline">Filter</span>
            <ChevronDown size={14} strokeWidth={3} className="md:ml-2" />
          </div>
        </button>
        <TextInput
          name="search"
          placeholder="Search…"
          autoComplete="off"
          value={values.search}
          onChange={handleChange}
          className="rounded-l-none border-0 focus:ring-2"
        />
      </div>
      <button
        onClick={reset}
        className="ml-3 text-sm text-gray-600 hover:text-gray-700 focus:text-indigo-700 focus:outline-none"
        type="button"
      >
        Reset
      </button>
    </div>
  );
}
