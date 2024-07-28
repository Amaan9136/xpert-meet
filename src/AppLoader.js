
const Loader = ({ message = "Loading..." }) => (
  <>
    <div className="transparent-background flex-col">
      <SyncLoader color="white" />
      <div className='mt-4'>{message}</div>
    </div>
  </>
);

