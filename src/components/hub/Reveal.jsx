import useInView from "../../lib/useInView";

export default function Reveal({ as, className = "", children, ...rest }) {
  const Tag = as || "div";
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${inView ? "in-view" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
