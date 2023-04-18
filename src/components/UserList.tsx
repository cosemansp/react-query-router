import { useQueryRouter } from "../hooks";
import { faker } from "@faker-js/faker";
import { FetchError } from "ofetch";
import { toast } from "react-toastify";

const UserList = () => {
  const router = useQueryRouter();
  const { data, error } = router.users.getAll.useQuery<FetchError>({});

  const { mutate } = router.users.save.useMutation({
    onSuccess: () => {
      router.users.getAll.invalidate({});
      toast.success("Successfully added a new user!");
    },
    onError: (error) => {
      router.users.getAll.invalidate({});
      toast.error(error.message);
    },
  });

  const addNewUser = () => {
    const lastName = faker.name.lastName();
    const firstName = faker.name.firstName();
    mutate({
      lastName,
      firstName,
      company: faker.company.name(),
      age: faker.datatype.number({ min: 18, max: 65 }),
      email: `${firstName}.${lastName}@${faker.internet.domainName()}`.toLowerCase(),
      image: "",
      phone: faker.phone.number(),
      address: {
        street: faker.address.street(),
        city: faker.address.city(),
        zip: faker.address.zipCode(),
      },
    });
  };

  if (error) {
    return (
      <div>
        Error: {error.message} - {error.statusText}
      </div>
    );
  }

  return (
    <div className="m-2">
      <h2 className="text-xl font-bold">Users</h2>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <td>Company</td>
            <td>First Name</td>
            <td>Last Name</td>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((user) => (
            <tr key={user.id}>
              <td>{user.company}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      Total: {data?.total}
      <br />
      <button className="btn btn-sm" onClick={addNewUser}>
        Add a new User
      </button>
    </div>
  );
};

export default UserList;
