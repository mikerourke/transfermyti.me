// @ts-ignore
const responses = {
  user: {
    apiFetchTogglUserDetails: {
      url: '/me',
      method: 'GET',
      response: {
        since: 1545596501,
        data: {
          id: 100001,
          api_token: 'testApiToken',
          default_wid: 200001,
          email: 'test@test.com',
          fullname: 'John User',
          jquery_timeofday_format: 'h:i A',
          jquery_date_format: 'm/d/Y',
          timeofday_format: 'h:mm A',
          date_format: 'MM/DD/YYYY',
          store_start_and_stop_time: false,
          beginning_of_week: 0,
          language: 'en_US',
          image_url: 'https://user.url',
          sidebar_piechart: true,
          at: '2017-09-10T21:02:53+00:00',
          created_at: '2016-11-01T18:05:24+00:00',
          retention: 9,
          record_timeline: true,
          render_timeline: true,
          timeline_enabled: true,
          timeline_experiment: false,
          new_blog_post: {},
          should_upgrade: true,
          achievements_enabled: true,
          timezone: 'America/Chicago',
          openid_enabled: true,
          openid_email: 'test@test.com',
          send_product_emails: false,
          send_weekly_report: false,
          send_timer_notifications: false,
          last_blog_entry: '',
          invitation: {},
          workspaces: [
            {
              id: 200001,
              name: 'Workspace A',
              profile: 0,
              premium: false,
              admin: true,
              default_hourly_rate: 0,
              default_currency: 'USD',
              only_admins_may_create_projects: false,
              only_admins_see_billable_rates: false,
              only_admins_see_team_dashboard: false,
              projects_billable_by_default: true,
              rounding: 0,
              rounding_minutes: 0,
              api_token: 'aToken',
              at: '2018-09-01T08:21:24+00:00',
              ical_enabled: true,
            },
          ],
          duration_format: 'improved',
          obm: {
            included: false,
            nr: 0,
            actions: 'tree',
          },
        },
      },
    },
  },
  workspaces: {
    apiFetchClockifyWorkspaces: {
      url: '/workspaces/',
      method: 'GET',
      response: [
        {
          id: 'testWorkspace',
          name: 'Testing',
          hourlyRate: {
            amount: 0,
            currency: 'USD',
          },
          memberships: [
            {
              userId: 'testUser',
              hourlyRate: null as any,
              membershipType: 'WORKSPACE',
              membershipStatus: 'ACTIVE',
              target: 'membershipTarget',
            },
          ],
          workspaceSettings: {
            timeRoundingInReports: false,
            onlyAdminsSeeBillableRates: true,
            onlyAdminsCreateProject: true,
            onlyAdminsSeeDashboard: false,
            defaultBillableProjects: true,
            lockTimeEntries: null as any,
            round: {
              round: 'Round to nearest',
              minutes: '15',
            },
            projectFavorites: true,
            canSeeTimeSheet: false,
            projectPickerSpecialFilter: false,
            forceProjects: false,
            forceTasks: false,
            forceTags: false,
            forceDescription: false,
            onlyAdminsSeeAllTimeEntries: false,
            onlyAdminsSeePublicProjectsEntries: false,
            trackTimeDownToSecond: true,
            projectGroupingLabel: 'client',
          },
          imageUrl: '',
        },
      ],
    },
    apiFetchTogglWorkspaces: {
      url: '/workspaces',
      method: 'GET',
      response: [
        {
          id: 200001,
          name: 'Workspace A',
          profile: 0,
          premium: false,
          admin: true,
          default_hourly_rate: 0,
          default_currency: 'USD',
          only_admins_may_create_projects: false,
          only_admins_see_billable_rates: false,
          only_admins_see_team_dashboard: false,
          projects_billable_by_default: false,
          rounding: 0,
          rounding_minutes: 0,
          api_token: 'aToken',
          at: '2018-11-13T02:36:04+00:00',
          ical_enabled: true,
        },
        {
          id: 200002,
          name: 'Workspace B',
          profile: 0,
          premium: false,
          admin: true,
          default_hourly_rate: 0,
          default_currency: 'USD',
          only_admins_may_create_projects: false,
          only_admins_see_billable_rates: false,
          only_admins_see_team_dashboard: false,
          projects_billable_by_default: true,
          rounding: 0,
          rounding_minutes: 0,
          api_token: 'bToken',
          at: '2017-06-29T14:48:42+00:00',
          ical_enabled: true,
        },
      ],
    },
  },
};

export default responses as any;
