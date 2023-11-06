interface Props {
  children: React.ReactNode;
}

const AppPanel = (props: Props) => {
  return (
    <div className="bg-white shadow-md sm:p-6 lg:p-12">{props.children}</div>
  );
};

export default AppPanel;
