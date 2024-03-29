import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { readJsonSync, uniqueId } from "../utilities.mjs";

const dbPath = fileURLToPath(
  new URL(path.join("..", "db", "clockify.json"), import.meta.url),
);

const db = readJsonSync(dbPath);

// TODO: Update routes to reflect V1 Clockify API only.
export function assignClockifyRoutes(router, isEmpty) {
  let entriesCreated = 20;

  router
    .get("/user", (req, res) => {
      const [firstUser] = db.users;
      res.status(200).send(firstUser);
    })

    .get("/workspaces/:workspaceId/clients", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.clients),
    )

    .get("/workspaces/:workspaceId/projects", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.projects),
    )

    .get("/workspaces/:workspaceId/projects/:projectId/users/", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.users),
    )

    .get("/workspaces/:workspaceId/tags", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.tags),
    )

    .get("/workspaces/:workspaceId/projects/:projectId/tasks", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.tasks),
    )

    .get("/workspaces/:workspaceId/user/:userId/time-entries", (req, res) => {
      if (isEmpty === true) {
        return res.status(200).send([]);
      }

      const responseEntries = db.timeEntries.reduce((acc, timeEntry) => {
        const { projectId, tagIds, taskId, ...responseEntry } = timeEntry;
        if (projectId) {
          const project = db.projects.find(
            (project) => project.id === projectId,
          );
          responseEntry.project = project ?? null;
        }

        if (tagIds.length !== 0) {
          responseEntry.tags = tagIds.map((tagId) =>
            db.tags.find(({ id }) => id === tagId),
          );
        } else {
          responseEntry.tags = [];
        }

        if (taskId) {
          const task = db.tasks.find((task) => task.id === taskId);
          responseEntry.task = task ?? null;
        }

        return [...acc, responseEntry];
      }, []);

      res.status(200).send(responseEntries);
    })

    .get("/workspaces/:workspaceId/user-groups/", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.userGroups),
    )

    .get("/workspaces/:workspaceId/users", (req, res) =>
      res.status(200).send(isEmpty === true ? [] : db.users),
    )

    .get("/workspaces", (req, res) => res.status(200).send(db.workspaces));

  router
    .post("/workspaces/:workspaceId/clients", (req, res) => {
      const newClient = {
        id: uniqueId("clock-client-0"),
        name: req.body.name,
        workspace: req.params.workspaceId,
      };

      res.status(200).send(newClient);
    })

    .post("/workspaces/:workspaceId/projects", (req, res) => {
      const newProject = {
        id: uniqueId("clock-client-0"),
        name: req.body.name,
        hourlyRate: {
          amount: 0,
          currency: "USD",
        },
        estimate: req.body.estimate,
        color: req.body.color,
        workspaceId: req.params.workspaceId,
        memberships: db.users?.["clock-user-01"]?.memberships ?? [],
        archived: false,
        duration: "PT0S",
        clientName: db.clients?.[req.body.clientId]?.name ?? null,
        public: req.body.isPublic,
        billable: req.body.billable,
      };

      res.status(200).send(newProject);
    })

    .post("/workspaces/:workspaceId/tags", (req, res) => {
      const newTag = {
        id: uniqueId("clock-tag-0"),
        name: req.body.name,
        workspace: req.params.workspaceId,
      };

      res.status(200).send(newTag);
    })

    .post("/workspaces/:workspaceId/projects/:projectId/tasks", (req, res) => {
      const newTask = {
        id: uniqueId("clock-task-"),
        name: req.body.name,
        workspace: req.params.workspaceId,
        projectId: req.params.projectId,
        assigneeIds: req.body.assigneeIds || [],
        estimate: req.body.estimate || "",
        status: "ACTIVE",
      };

      res.status(200).send(newTask);
    })

    .post("/workspaces/:workspaceId/time-entries", (req, res) => {
      const [firstUser] = db.users;
      entriesCreated += 1;

      const newTimeEntry = {
        id: "clock-entry-".concat(entriesCreated.toString()),
        billable: req.body.billable,
        description: req.body.description,
        projectId: req.body.projectId,
        tagIds: req.body.tagIds,
        userId: firstUser.id,
        workspaceId: req.body.workspaceId,
        isLocked: false,
        timeInterval: {
          start: req.body.start,
          end: req.body.end,
          duration: "",
        },
      };

      res.status(200).send(newTimeEntry);
    })

    .post("/workspaces/:workspaceId/user-groups", (req, res) => {
      const newUserGroup = {
        id: uniqueId("clock-user-group-0"),
        name: req.body.name,
        workspace: req.params.workspaceId,
        userIds: [],
      };

      res.status(200).send(newUserGroup);
    })

    .post("/workspaces/:workspaceId/users", (req, res) => {
      const workspace = db.workspaces?.[req.params.workspaceId] ?? {};
      res.status(200).send(workspace);
    })

    .post("/workspaces", (req, res) => {
      const [firstWorkspace] = db.workspaces;
      const newWorkspace = {
        ...firstWorkspace,
        id: uniqueId("clock-workspace-0"),
        name: req.body.name,
      };

      res.status(200).send(newWorkspace);
    });

  router.put("/workspaces/:workspaceId/projects/:projectId", (req, res) =>
    res.status(200).send(req.body),
  );

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

    .delete("/workspaces/:workspaceId/time-entries/:timeEntryId", (req, res) =>
      res.status(200).send({}),
    )

    .delete("/workspaces/:workspaceId/user-groups/:userGroupId", (req, res) =>
      res.status(200).send({}),
    )

    .delete("/users/:userId", (req, res) => res.status(200).send());
}
