import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
};

const BASE = "https://selflearningmedicalanalyst.lovable.app";

export function Seo({ title, description, path = "/", noindex }: Props) {
  const url = `${BASE}${path}`;
  const desc = description ?? "AI-powered self-learning medical analyst for intelligent report processing and healthcare analytics.";
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}