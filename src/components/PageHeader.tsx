import React from "react";
import styled from "@emotion/styled";

const Title = styled.h1({
  marginBottom: 0,
  fontSize: "1.5rem",
  color: "var(--dark-gray)",
  fontWeight: 600,
  lineHeight: 1.125,
});

const Subtitle = styled.h2({
  marginBottom: "0.5rem",
  fontSize: "2rem",
  fontWeight: 400,
  color: "var(--dark-gray)",
});

interface Props {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<Props> = ({ title, subtitle }) => (
  <>
    <Title data-testid="page-header-title">{title}</Title>
    <Subtitle data-testid="page-header-subtitle">{subtitle}</Subtitle>
  </>
);

export default PageHeader;
