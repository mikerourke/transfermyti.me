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

    .get("/workspaces/:workspaceId/projects/:projectId/tasks", (req, res) =>
      res
        .status(200)
        .send(
          isEmpty === true
            ? []
            : db.tasks.filter(
                (task) =>
                  task.workspace_id === +req.params.workspaceId &&
                  task.project_id === +req.params.projectId,
              ),
        ),
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

    .get("/me/workspaces", (req, res) => res.status(200).send(db.workspaces))

    .get("/workspaces/:workspaceId/workspace_users", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.workspaceUsers),
    );

  router
    .post("/workspaces/:workspaceId/clients", (req, res) => {
      const client = req.body;

      const newClient = {
        id: +uniqueId("30"),
        wid: +req.params.workspaceId,
        name: client.name,
        at: new Date().toLocaleString(),
      };

      res.status(200).send(newClient);
    })

    .post("/workspaces/:workspaceId/projects", (req, res) => {
      const project = req.body;

      const newProject = {
        id: +uniqueId("20"),
        workspace_id: +req.params.workspaceId,
        client_id: +project.client_id,
        name: project.name,
        is_private: true,
        active: true,
        at: new Date().toLocaleString(),
        created_at: new Date().toLocaleString(),
        color: "#ea468d",
        server_deleted_at: null,
        billable: null,
        template: null,
        auto_estimates: null,
        estimated_hours: null,
        rate: null,
        rate_last_updated: null,
        currency: null,
        recurring: false,
        recurring_parameters: null,
        current_period: null,
        fixed_fee: null,
        actual_hours: 0,
      };

      console.log(newProject);

      res.status(200).send(newProject);
    })

    .post("/workspaces/:workspaceId/tags", (req, res) => {
      const tag = req.body;

      const newTag = {
        id: +uniqueId("40"),
        workspace_id: +req.params.workspaceId,
        name: tag.name,
        at: new Date().toLocaleString(),
        deleted_at: null,
      };

      res.status(200).send(newTag);
    })

    .post("/workspaces/:workspaceId/projects/:projectId/tasks", (req, res) => {
      const task = req.body;

      const newTask = {
        id: +uniqueId("70"),
        name: task.name,
        workspace_id: +req.params.workspaceId,
        project_id: +req.params.projectId,
        user_id: task.user_id,
        active: true,
        at: new Date().toLocaleString(),
        estimated_seconds: 0,
        tracked_seconds: 0,
        server_deleted_at: null,
      };

      res.status(200).send(newTask);
    })

    .post("/workspaces/:workspaceId/time_entries", (req, res) => {
      const timeEntry = req.body;

      const newTimeEntry = {
        id: +uniqueId("80"),
        project_id: +timeEntry.project_id,
        task_id: +timeEntry.task_id,
        user_id: +timeEntry.user_id,
        workspace_id: +timeEntry.workspace_id,
        description: timeEntry.description,
        start: timeEntry.start,
        stop: timeEntry.stop,
        at: new Date().toLocaleString(),
        server_deleted_at: null,
        duration: timeEntry.duration,
        duronly: false,
        billable: timeEntry.billable,
        tag_ids: timeEntry.tag_ids,
        tags: timeEntry.tags,
      };

      res.status(200).send(newTimeEntry);
    })

    .post("/groups", (req, res) => {
      const newUserGroup = {
        id: +uniqueId("50"),
        workspace_id: +req.body.workspace_id,
        name: req.body.name,
        at: new Date().toLocaleString(),
      };

      res.status(200).send(newUserGroup);
    });

  router
    .delete("/workspaces/:workspaceId/clients/:clientId", (req, res) =>
      res.status(200).send(),
    )

    .delete("/workspaces/:workspaceId/projects/:projectId", (req, res) =>
      res.status(200).send(),
    )

    .delete("/workspaces/:workspaceId/tags/:tagId", (req, res) =>
      res.status(200).send(),
    )

    .delete(
      "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
      (req, res) => res.status(200).send(),
    )

    .delete("/workspaces/:workspaceId/time_entries/:timeEntryId", (req, res) =>
      res.status(200).send(),
    )

    .delete("/groups/:userGroupId", (req, res) => res.status(200).send())

    .delete("/project_users/:userId", (req, res) => res.status(200).send());
}
