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
      const [user] = db.users;

      res.status(200).send(user);
    })

    .get("/workspaces/:workspaceId/clients", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.clients),
    )

    .get("/workspaces/:workspaceId/projects", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.projects),
    )

    .get("/workspaces/:workspaceId/project_users", (req, res) =>
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
    .post("/workspaces/:workspaceId/clients", (req, res) => {
      const { client } = req.body;

      const newClient = {
        id: +uniqueId("30"),
        wid: +req.params.workspaceId,
        name: client.name,
        at: new Date().toLocaleString(),
      };

      res.status(200).send(newClient);
    })

    .post("/workspaces/:workspaceId/projects", (req, res) => {
      const { project } = req.body;

      const newProject = {
        id: +uniqueId("20"),
        workspace_id: +req.params.workspaceId,
        client_id: +project.client_id,
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

    .post("/workspaces/:workspaceId/tags", (req, res) => {
      const { tag } = req.body;

      const newTag = {
        id: +uniqueId("40"),
        workspace_id: +req.params.workspaceId,
        name: tag.name,
      };

      res.status(200).send(newTag);
    })

    .post("/workspaces/:workspaceId/projects/:projectId/tasks", (req, res) => {
      const { task } = req.body;

      const newTask = {
        id: +uniqueId("70"),
        project_id: +req.params.projectId,
        workspace_id: +req.params.workspaceId,
        name: task.name,
        active: true,
        estimated_seconds: 0,
      };

      res.status(200).send(newTask);
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
    .delete("/workspaces/:workspaceId/clients/:clientId", (req, res) =>
      res.status(200).send({}),
    )

    .delete("/workspaces/:workspaceId/projects/:projectId", (req, res) =>
      res.status(200).send({}),
    )

    .delete("/workspaces/:workspaceId/tags/:tagId", (req, res) =>
      res.status(200).send({}),
    )

    .delete(
      "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
      (req, res) => res.status(200).send({}),
    )

    .delete("/time_entries/:timeEntryId", (req, res) =>
      res.status(200).send({}),
    )

    .delete("/groups/:userGroupId", (req, res) => res.status(200).send({}))

    .delete("/project_users/:userId", (req, res) => res.status(200).send());
}
