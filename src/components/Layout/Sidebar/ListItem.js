import { useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import Link from "next/link";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { useRouter } from "next/router";

export const SingleLevel = ({ item, userLevel }) => {
  const routes = useRouter();
  const isActive = () => routes.pathname === item.path;

  if (item.limit && !item.limit.includes(userLevel)) return <></>;
  return (
    <Link href={item.path} passHref={true} legacyBehavior>
      <a>
        <ListItemButton
          sx={{
            color: isActive() ? "primary.main" : "",
          }}
        >
          <Tooltip title={item.title} placement="right">
            <ListItemIcon
              sx={{
                color: isActive() ? "primary.main" : "",
              }}
            >
              {item.icon}
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary={item.title} />
        </ListItemButton>
      </a>
    </Link>
  );
};

export const MultiLevel = ({ item, userLevel }) => {
  const routes = useRouter();
  const firstPath = routes.pathname.split("/")[2];

  const isActive = () => firstPath === item.title.toLowerCase();

  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  if (item.limit && !item.limit.includes(userLevel)) return <></>;
  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          color: isActive() ? "primary.main" : "",
        }}
      >
        <Tooltip title={item.title} placement="right">
          <ListItemIcon
            sx={{
              color: isActive() ? "primary.main" : "",
            }}
          >
            {item.icon}
          </ListItemIcon>
        </Tooltip>
        <ListItemText primary={item.title} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding dense>
          {item.children.map((child, key) => (
            <Box key={key} sx={{ paddingLeft: 1, paddingY: 0 }}>
              <MenuItem item={child} userLevel={userLevel} />
            </Box>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export const MenuItem = ({ item, userLevel }) => {
  const Component = item.children ? MultiLevel : SingleLevel;
  return <Component item={item} userLevel={userLevel} />;
};
