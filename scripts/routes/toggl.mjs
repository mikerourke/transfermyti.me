import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { isSameYear } from "date-fns";

import { readJsonSync, uniqueId } from "../utilities.mjs";

const dbPath = fileURLToPath(
  new URL(path.join("..", "db", "toggl.json"), import.meta.url),
);

const db = readJsonSync(dbPath);

export function assignTogglRoutes(router, isEmpty) {
  router
    .get("/me", (req, res) => {
      const [firstUser] = db.users;
      const payload = {
        since: 1555774945,
        data: {
          ...firstUser,
          workspaces: db.workspaces,
        },
      };

      res.status(200).send(payload);
    })
    .get("/workspaces/:workspaceId/clients", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.clients),
    )
    .get("/workspaces/:workspaceId/projects", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.projects),
    )
    .get("/projects/:projectId/project_users", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.projectUsers),
    )
    .get("/workspaces/:workspaceId/tags", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.tags),
    )
    .get("/workspaces/:workspaceId/tasks", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.tasks),
    )
    .get("/details", (req, res) => {
      const { since } = req.query;
      const queryDate = new Date(since);

      const timeEntries = Object.values(db.timeEntries).filter(({ start }) =>
        isSameYear(queryDate, new Date(start)),
      );

      const payload = {
        total_grand: isEmpty === true ? 0 : 10000,
        total_billable: isEmpty === true ? 0 : 10000,
        total_currencies: [],
        total_count: isEmpty === true ? 0 : timeEntries.length,
        per_page: 50,
        data: isEmpty === true ? [] : timeEntries.slice(0, 50),
      };

      res.status(200).send(payload);
    })
    .get("/workspaces/:workspaceId/groups", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.userGroups),
    )
    .get("/workspaces/:workspaceId/users", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.users),
    )
    .get("/workspaces", (req, res) => res.status(200).send(db.workspaces))
    .get("/workspaces/:workspaceId/workspace_users", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.workspaceUsers),
    );

  router
    .post("/clients", (req, res) => {
      const { client } = req.body;

      const newClient = {
        id: +uniqueId("30"),
        wid: +client.wid,
        name: client.name,
        at: new Date().toLocaleString(),
      };

      res.status(200).send({ data: newClient });
    })
    .post("/projects", (req, res) => {
      const { project } = req.body;

      const newProject = {
        id: +uniqueId("20"),
        wid: +project.wid,
        cid: +project.cid,
        name: project.name,
        billable: false,
        is_private: true,
        active: true,
        color: "5",
        at: new Date().toLocaleString(),
      };

      console.log(newProject);

      res.status(200).send({ data: newProject });
    })
    .post("/tags", (req, res) => {
      const { tag } = req.body;

      const newTag = {
        id: +uniqueId("40"),
        wid: +tag.wid,
        name: tag.name,
      };

      res.status(200).send({ data: newTag });
    })
    .post("/tasks", (req, res) => {
      const { task } = req.body;

      const [workspace] = db.workspaces;
      const newTask = {
        id: +uniqueId("70"),
        pid: +task.pid,
        wid: +workspace.id,
        name: task.name,
        active: true,
        estimated_seconds: 0,
      };

      res.status(200).send({ data: newTask });
    })
    .post("/time_entries", (req, res) => {
      const { time_entry: entry } = req.body;

      const newTimeEntry = {
        id: +uniqueId("80"),
        pid: +entry.pid,
        wid: +entry.wid,
        description: entry.description,
        billable: entry.billable,
        duration: entry.duration,
        start: entry.start,
        tags: entry.tags,
      };

      res.status(200).send({ data: newTimeEntry });
    })
    .post("/groups", (req, res) => {
      const newUserGroup = {
        id: +uniqueId("50"),
        wid: +req.body.wid,
        name: req.body.name,
        at: new Date().toLocaleString(),
      };

      res.status(200).send({ data: newUserGroup });
    });

  router
    .delete("/clients/:clientId", (req, res) => res.status(200).send({}))
    .delete("/projects/:projectId", (req, res) => res.status(200).send({}))
    .delete("/tags/:tagId", (req, res) => res.status(200).send({}))
    .delete("/tasks/:taskId", (req, res) => res.status(200).send({}))
    .delete("/time_entries/:timeEntryId", (req, res) =>
      res.status(200).send({}),
    )
    .delete("/groups/:userGroupId", (req, res) => res.status(200).send({}))
    .delete("/project_users/:userId", (req, res) => res.status(200).send());
}
