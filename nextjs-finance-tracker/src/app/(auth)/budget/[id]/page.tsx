// interface Props {
//   params: {
//     id: string;
//   };
// }

interface Props {
  params: {
    id: string;
  };
}

export default async function DetailBudget({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1>Hai {id}</h1>
    </div>
  );
}
