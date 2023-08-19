import React, { useContext, useEffect, useRef, useState } from "react";

//import { makeStyles } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import {
  Search,
  MoveToInbox,
  CheckBox
} from "@mui/icons-material";

import InputBase from "@mui/material/InputBase";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Box, Button } from "@mui/material";

const TicketsManager = () => {

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN")
      setShowAllTickets(true);
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef?.current.focus();
      setSearchParam("");
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => setTabOpen(newValue);

  const applyPanelStyle = (status) => {
    console.log(tabOpen, status)
    if (tabOpen !== status) 
      return { width: 0, height: 0, overflow: "hidden" }
    else 
      return {}
  };

  return (
    <Paper elevation={0} variant="outlined">
      
      <NewTicketModal modalOpen={newTicketModalOpen} onClose={() => setNewTicketModalOpen(false)} />
      
      <Paper elevation={0} square>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs"
        >
          <Tab
            value={"open"}
            icon={<MoveToInbox />}
            label={i18n.t("tickets.tabs.open.title")}
          />
          <Tab
            value={"closed"}
            icon={<CheckBox />}
            label={i18n.t("tickets.tabs.closed.title")}
          />
          <Tab
            value={"search"}
            icon={<Search />}
            label={i18n.t("tickets.tabs.search.title")}
          />
        </Tabs>
      </Paper>

      <Paper square elevation={0}>
        {tab === "search" ? (
          <div>
            <Search />

            <InputBase
              type="search"
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              onChange={handleSearch}
            />
          </div>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can 
              role={user.profile} 
              perform="tickets-manager:showall" 
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() => setShowAllTickets((prevState) => !prevState)}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
        )}

        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
        
      </Paper>

      <TabPanel value={tab} name="open">
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={
              <Badge badgeContent={openCount} color="primary"> 
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab label={
              <Badge badgeContent={pendingCount} color="secondary" >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        
        <TicketsList
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}       
          sx={{
            ...applyPanelStyle("open")
          }}   
        />

        <TicketsList
          status="pending"
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          sx={{
            ...applyPanelStyle("pending")
          }} 
        />
      </TabPanel>
      
      <TabPanel value={tab} name="closed">
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      
      <TabPanel value={tab} name="search">
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManager;
