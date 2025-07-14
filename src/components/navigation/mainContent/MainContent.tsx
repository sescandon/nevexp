import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import styles from "./MainContent.module.less";

export function MainContent() {
  return (
    <div className={`${styles.mainContainer} `}>
      <RouterProvider router={router} />
    </div>
  );
}
