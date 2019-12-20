import { groupByWorkspace } from "~/utils";

const clients: any = [
  {
    entryCount: 0,
    id: "2FZn1Y9R5M4nnMGV9K32xJ",
    isIncluded: true,
    linkedId: null,
    name: "Client A",
    workspaceId: "aZJSPbcPw1cpdfYmtHM7za",
  },
  {
    entryCount: 0,
    id: "ir4aN5VF7pdfDrgWjGCxeR",
    isIncluded: true,
    linkedId: null,
    name: "Client B",
    workspaceId: "aZJSPbcPw1cpdfYmtHM7za",
  },
  {
    entryCount: 0,
    id: "uABwBW6XWsWLRzRtKY1gow",
    isIncluded: true,
    linkedId: null,
    name: "Client C",
    workspaceId: "aZJSPbcPw1cpdfYmtab67a",
  },
];

describe("the groupByWorkspace method", () => {
  test("groups entity records by workspaceId", () => {
    const result = groupByWorkspace(clients);
    const expected = ["aZJSPbcPw1cpdfYmtHM7za", "aZJSPbcPw1cpdfYmtab67a"];

    expect(Object.keys(result)).toEqual(expected);
  });

  test("ignores entity records with missing workspaceIds", () => {
    const updatedClients = clients.map(
      ({ workspaceId, ...client }: any) => client,
    );
    const result = groupByWorkspace(updatedClients);

    expect(result).toEqual({});
  });
});
