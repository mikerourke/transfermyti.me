import React from "react";
import { styled } from "~/components";

const Title = styled.h2({
  fontSize: "1.25rem",
  fontWeight: 400,
  margin: "0 0 0.5rem 0.5rem",
});

const Bar = styled.div(
  {
    borderRadius: "3rem",
    height: "1.5rem",
    position: "relative",
    width: "100%",
  },
  ({ theme }) => ({
    boxShadow: theme.elevation.dp2,
  }),
);

const Filler = styled.div(
  {
    borderRadius: "inherit",
    height: "100%",
    transition: "width 0.2s ease-in",
  },
  ({ theme }) => ({
    background: theme.colors.success,
    boxShadow: theme.elevation.dp2,
  }),
);

interface Props extends React.HTMLProps<HTMLDivElement> {
  completedCount: number;
  totalCount: number;
  title: string;
}

const ProgressBar: React.FC<Props> = ({
  completedCount,
  totalCount,
  title,
  ...props
}) => {
  let percentage = (completedCount / totalCount) * 100;
  if (Number.isNaN(percentage)) {
    percentage = 0;
  }
  return (
    <div css={{ marginBottom: "1rem", marginTop: "0.5rem" }} {...props}>
      <Title>{title}</Title>
      <Bar>
        <Filler css={{ width: `${percentage}%` }} />
      </Bar>
    </div>
  );
};

export default ProgressBar;
