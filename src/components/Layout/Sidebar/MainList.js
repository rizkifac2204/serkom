import { MenuItem } from "./ListItem";
import {
  mainRoutes,
  dipRoutes,
  settingRoutes,
  chartRoutes,
} from "components/routes";

export const MainList = ({ userLevel }) => {
  if (!userLevel) return <></>;
  return mainRoutes.map((item) => (
    <MenuItem key={item.title} item={item} userLevel={userLevel} />
  ));
};

export const SettingList = ({ userLevel }) => {
  if (!userLevel) return <></>;
  return settingRoutes.map((item) => (
    <MenuItem key={item.title} item={item} userLevel={userLevel} />
  ));
};

export const ChartList = ({ userLevel }) => {
  if (!userLevel) return <></>;
  return chartRoutes.map((item) => (
    <MenuItem key={item.title} item={item} userLevel={userLevel} />
  ));
};

export const DipList = ({ userLevel }) => {
  if (!userLevel) return <></>;
  return dipRoutes.map((item) => (
    <MenuItem key={item.title} item={item} userLevel={userLevel} />
  ));
};
