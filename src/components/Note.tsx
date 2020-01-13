import { styled } from "./emotion";

const Note = styled.p<{ as?: string }>({}, ({ theme }) => ({
  color: theme.colors.eggplant,
  fontWeight: theme.fontWeights.bold,
}));

export default Note;
