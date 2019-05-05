import path from 'path';
import fsExtra from 'fs-extra';
import { isSameYear } from 'date-fns';
import { find, get, uniqueId } from 'lodash';

const dbPath = path.resolve(__dirname, '..', 'db', 'clockify.json');
const db = fsExtra.readJSONSync(dbPath);

const isEmpty = process.env.LOCAL_API_CLOCKIFY_EMPTY;

export function assignClockifyRoutes(router) {
  let entriesCreated = 20;

  router
    .get('/v1/user', (req, res) => {
      const [firstUser] = db.users;
      res.status(200).send(firstUser);
    })
    .get('/users/:userId', (req, res) => {
      const [firstUser] = db.users;
      res.status(200).send(firstUser);
    })
    .get('/workspaces/:workspaceId/clients/', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.clients),
    )
    .post('/workspaces/:workspaceId/projects/filtered', (req, res) => {
      const { projects } = db;
      const payload = isEmpty
        ? { project: [], count: 0 }
        : { project: projects, count: projects.length };
      res.status(200).send(payload);
    })
    .get('/workspaces/:workspaceId/projects/:projectId/users/', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.users),
    )
    .get('/workspaces/:workspaceId/tags/', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.tags),
    )
    .get('/workspaces/:workspaceId/projects/:projectId/tasks/', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.tasks),
    )
    .post(
      '/workspaces/:workspaceId/timeEntries/user/:userId/entriesInRange',
      (req, res) => {
        const { start } = req.query;
        const filterStart = new Date(start);

        const timeEntriesToSend = db.timeEntries.reduce((acc, timeEntry) => {
          const entryStart = new Date(timeEntry.timeInterval.start);
          if (!isSameYear(filterStart, entryStart)) {
            return acc;
          }

          const matchingProject = find(db.projects, {
            id: timeEntry.projectId,
          });
          const matchingUser = find(db.users, { id: timeEntry.userId });

          return [
            ...acc,
            {
              ...timeEntry,
              project: matchingProject,
              user: matchingUser,
            },
          ];
        }, []);

        res.status(200).send(isEmpty ? [] : timeEntriesToSend);
      },
    )
    .get('/workspaces/:workspaceId/userGroups/', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.userGroups),
    )
    .get('/workspaces/:workspaceId/users', (req, res) =>
      res.status(200).send(isEmpty ? [] : db.users),
    )
    .get('/workspaces/', (req, res) => res.status(200).send(db.workspaces));

  router
    .post('/workspaces/:workspaceId/clients/', (req, res) => {
      const newClient = {
        id: uniqueId('clock-client-0'),
        name: req.body.name,
        workspace: req.params.workspaceId,
      };

      res.status(200).send(newClient);
    })
    .post('/workspaces/:workspaceId/projects', (req, res) => {
      const newProject = {
        id: uniqueId('clock-client-0'),
        name: req.body.name,
        hourlyRate: {
          amount: 0,
          currency: 'USD',
        },
        estimate: req.body.estimate,
        color: req.body.color,
        workspaceId: req.params.workspaceId,
        memberships: get(db.users, ['clock-user-01', 'memberships'], []),
        archived: false,
        duration: 'PT0S',
        clientName: get(db.clients, [req.body.clientId, 'name'], null),
        public: req.body.isPublic,
        billable: req.body.isBillable,
      };

      res.status(200).send(newProject);
    })
    .post('/workspaces/:workspaceId/tags/', (req, res) => {
      const newTag = {
        id: uniqueId('clock-tag-0'),
        name: req.body.name,
        workspace: req.params.workspaceId,
      };

      res.status(200).send(newTag);
    })
    .post('/workspaces/:workspaceId/tasks/', (req, res) => {
      const newTask = {
        id: uniqueId('clock-task-0'),
        name: req.body.name,
        workspace: req.params.workspaceId,
      };

      res.status(200).send(newTask);
    })
    .post('/workspaces/:workspaceId/timeEntries/', (req, res) => {
      const [firstUser] = db.users;
      entriesCreated += 1;

      const newTimeEntry = {
        id: 'clock-entry-'.concat(entriesCreated.toString()),
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
          duration: '',
        },
      };

      res.status(200).send(newTimeEntry);
    })
    .post('/workspaces/:workspaceId/userGroups/', (req, res) => {
      const newUserGroup = {
        id: uniqueId('clock-user-group-0'),
        name: req.body.name,
        workspace: req.params.workspaceId,
        userIds: [],
      };

      res.status(200).send(newUserGroup);
    })
    .post('/workspaces/:workspaceId/users', (req, res) => {
      const workspace = get(db.workspaces, req.params.workspaceId, {});
      res.status(200).send(workspace);
    })
    .post('/workspaces/', (req, res) => {
      const [firstWorkspace] = db.workspaces;
      const newWorkspace = {
        ...firstWorkspace,
        id: uniqueId('clock-workspace-0'),
        name: req.body.name,
      };

      res.status(200).send(newWorkspace);
    });
}
