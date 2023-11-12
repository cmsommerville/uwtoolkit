interface Props {
  children: React.ReactNode;
  className?: string;
}

const AppPanel = (props: Props) => {
  return (
    <div
      className={`bg-white shadow-md rounded sm:p-6 lg:p-12 ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );
};

export default AppPanel;
