import LoadingButton from "@/Components/Button/LoadingButton";
import FieldGroup from "@/Components/Form/FieldGroup";
import FileInput from "@/Components/Form/FileInput";
import SelectInput from "@/Components/Form/SelectInput";
import TextInput from "@/Components/Form/TextInput";
import MainLayout from "@/Layouts/MainLayout";
import { Link, useForm } from "@inertiajs/react";

const Create = () => {
  const { data, setData, errors, post, processing } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    owner: "0",
    photo: "",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    post("/users");
  }

  return (
    <div>
      <div>
        <h1 className="mb-8 text-3xl font-bold">
          <Link href="/users" className="text-indigo-600 hover:text-indigo-700">
            Users
          </Link>
          <span className="font-medium text-indigo-600"> /</span> Create
        </h1>
      </div>
      <div className="card max-w-3xl">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <div className="grid gap-6 lg:grid-cols-2">
              <FieldGroup
                label="First Name"
                name="first_name"
                error={errors.first_name}
              >
                <TextInput
                  name="first_name"
                  error={errors.first_name}
                  value={data.first_name}
                  onChange={(e) => setData("first_name", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup
                label="Last Name"
                name="last_name"
                error={errors.last_name}
              >
                <TextInput
                  name="last_name"
                  error={errors.last_name}
                  value={data.last_name}
                  onChange={(e) => setData("last_name", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label="Email" name="email" error={errors.email}>
                <TextInput
                  name="email"
                  type="email"
                  error={errors.email}
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup
                label="Password"
                name="password"
                error={errors.password}
              >
                <TextInput
                  name="password"
                  type="password"
                  error={errors.password}
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label="Owner" name="owner" error={errors.owner}>
                <SelectInput
                  name="owner"
                  error={errors.owner}
                  value={data.owner}
                  onChange={(e) => setData("owner", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                />
              </FieldGroup>

              <FieldGroup label="Photo" name="photo" error={errors.photo}>
                <FileInput
                  name="photo"
                  accept="image/*"
                  error={errors.photo}
                  value={data.photo}
                  onChange={(photo) =>
                    setData("photo", photo as unknown as string)
                  }
                />
              </FieldGroup>
            </div>
          </div>
          <div className="card-footer flex items-center justify-end">
            <LoadingButton
              loading={processing}
              type="submit"
              className="btn-indigo"
            >
              Create User
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Create.layout = (page: React.ReactNode) => (
  <MainLayout title="Create User" children={page} />
);

export default Create;
