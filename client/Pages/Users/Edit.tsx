import DeleteButton from "@/Components/Button/DeleteButton";
import LoadingButton from "@/Components/Button/LoadingButton";
import FieldGroup from "@/Components/Form/FieldGroup";
import FileInput from "@/Components/Form/FileInput";
import SelectInput from "@/Components/Form/SelectInput";
import TextInput from "@/Components/Form/TextInput";
import TrashedMessage from "@/Components/Messages/TrashedMessage";
import MainLayout from "@/Layouts/MainLayout";
import { User } from "@/types";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import React from "react";

const Edit = () => {
  const { user } = usePage<{
    user: User & { password: string; photo: File | null };
  }>().props;

  const { data, setData, errors, post, processing } = useForm({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    password: user.password || "",
    owner: user.owner ? "1" : "0",
    photo: "",

    // NOTE: When working with Laravel PUT/PATCH requests and FormData
    // you SHOULD send POST request and fake the PUT request like this.
    _method: "put",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // NOTE: We are using POST method here, not PUT/PATCH. See comment above.
    post(`/users/${user.id}`);
  }

  function destroy() {
    if (confirm("Are you sure you want to delete this user?")) {
      router.delete(`/users/${user.id}`);
    }
  }

  function restore() {
    if (confirm("Are you sure you want to restore this user?")) {
      router.put(`/users/${user.id}/restore`);
    }
  }

  return (
    <div>
      <Head title={`${data.first_name} ${data.last_name}`} />
      <div className="mb-8 flex max-w-lg justify-start">
        <h1 className="text-3xl font-bold">
          <Link href="/users" className="text-indigo-600 hover:text-indigo-700">
            Users
          </Link>
          <span className="mx-2 font-medium text-indigo-600">/</span>
          {data.first_name} {data.last_name}
        </h1>
        {user.photo && (
          <img className="ml-4 block h-8 w-8 rounded-full" src={user.photo} />
        )}
      </div>
      {user.deleted_at && (
        <TrashedMessage
          message="This user has been deleted."
          onRestore={restore}
        />
      )}
      <div className="max-w-3xl overflow-hidden rounded bg-white shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 p-8 lg:grid-cols-2">
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
                onChange={(photo) => {
                  setData("photo", photo as unknown as string);
                }}
              />
            </FieldGroup>
          </div>
          <div className="flex items-center border-t border-gray-200 bg-gray-100 px-8 py-4">
            {!user.deleted_at && (
              <DeleteButton onDelete={destroy}>Delete User</DeleteButton>
            )}
            <LoadingButton
              loading={processing}
              type="submit"
              className="btn-indigo ml-auto"
            >
              Update User
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
Edit.layout = (page: React.ReactNode) => <MainLayout children={page} />;

export default Edit;
