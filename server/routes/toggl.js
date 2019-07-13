/* eslint-disable @typescript-eslint/camelcase */
import path from "path";
import fsExtra from "fs-extra";
import { isSameYear } from "date-fns";
import { take } from "lodash";

const dbPath = path.resolve(__dirname, "..", "db", "toggl.json");
const db = fsExtra.readJSONSync(dbPath);

export function assignTogglRoutes(router) {
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
      res.status(200).send(db.clients),
    )
    .get("/workspaces/:workspaceId/projects", (req, res) =>
      res.status(200).send(db.projects),
    )
    .get("/projects/:projectId/project_users", (req, res) =>
      res.status(200).send(db.projectUsers),
    )
    .get("/workspaces/:workspaceId/tags", (req, res) =>
      res.status(200).send(db.tags),
    )
    .get("/workspaces/:workspaceId/tasks", (req, res) =>
      res.status(200).send(db.tasks),
    )
    .get("/details", (req, res) => {
      const { since } = req.query;
      const queryDate = new Date(since);

      const timeEntries = Object.values(db.timeEntries).filter(({ start }) =>
        isSameYear(queryDate, new Date(start)),
      );

      const payload = {
        total_grand: 10000,
        total_billable: 10000,
        total_currencies: [],
        total_count: timeEntries.length,
        per_page: 50,
        data: take(timeEntries, 50),
      };

      res.status(200).send(payload);
    })
    .get("/workspaces/:workspaceId/groups", (req, res) =>
      res.status(200).send(db.userGroups),
    )
    .get("/workspaces/:workspaceId/users", (req, res) =>
      res.status(200).send(db.users),
    )
    .get("/workspaces", (req, res) => res.status(200).send(db.workspaces))
    .get("/workspaces/:workspaceId/workspace_users", (req, res) =>
      res.status(200).send(db.workspaceUsers),
    );
}
