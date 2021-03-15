import React from "react";
import { GroupEditor } from "./GroupEditor";
import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Route
        path="/"
        exact
        render={() => {
          return <Redirect to={`/group/${Date.now()}`} />;
        }}
      />
      <Route path="/group/:id" component={GroupEditor} />
    </Router>
  );
};

export default App;
