"""
evaluation/report.py — Console summary reporter for evaluation results.

Parses the LangSmith EvaluationResults object and prints a readable table.
"""

from collections import defaultdict


def print_summary(results) -> None:
    """
    Parse LangSmith EvaluationResults and print a formatted summary table.

    Args:
        results: The object returned by langsmith.evaluate()
    """
    print()
    print("=" * 60)
    print("  📊 Evaluation Summary")
    print("=" * 60)

    # Collect scores per metric
    scores: dict[str, list[float]] = defaultdict(list)

    try:
        for result in results:
            # Handle both dict and object (LangSmith SDK can return either)
            eval_res = getattr(result, "evaluation_results", None) or (
                result.get("evaluation_results", {}) if isinstance(result, dict) else {}
            )
            
            # Extract results list
            metric_results = (
                eval_res.get("results", []) if isinstance(eval_res, dict) else 
                getattr(eval_res, "results", [])
            )
            
            for er in metric_results:
                key = getattr(er, "key", None) or (
                    er.get("key", "unknown") if isinstance(er, dict) else "unknown"
                )
                score = getattr(er, "score", None) or (
                    er.get("score", None) if isinstance(er, dict) else None
                )
                
                if score is not None:
                    try:
                        scores[str(key)].append(float(score))
                    except (ValueError, TypeError):
                        pass
    except Exception as e:
        print(f"⚠️  Could not fully parse results: {e}")
        print("   Check LangSmith dashboard for detailed results.\n")
        return

    if not scores:
        print("⚠️  No scores found. Check LangSmith dashboard for results.\n")
        return

    # Print table
    print(f"  {'Metric':<22} {'Avg Score':>10}  {'Pass Rate':>10}  {'Samples':>8}")
    print("  " + "-" * 54)

    all_scores = []
    PASS_THRESHOLD = 0.6  # score >= 0.6 is considered a "pass"

    for metric, metric_scores in sorted(scores.items()):
        avg     = sum(metric_scores) / len(metric_scores)
        pass_ct = sum(1 for s in metric_scores if s >= PASS_THRESHOLD)
        rate    = pass_ct / len(metric_scores) * 100
        n       = len(metric_scores)

        # Emoji indicator
        indicator = "✅" if avg >= 0.7 else ("⚠️ " if avg >= 0.5 else "❌")
        print(f"  {indicator} {metric:<20} {avg:>10.2f}  {rate:>9.0f}%  {n:>8}")
        all_scores.extend(metric_scores)

    print("  " + "-" * 54)

    if all_scores:
        overall     = sum(all_scores) / len(all_scores)
        overall_pass = sum(1 for s in all_scores if s >= PASS_THRESHOLD) / len(all_scores) * 100
        indicator   = "✅" if overall >= 0.7 else ("⚠️ " if overall >= 0.5 else "❌")
        print(f"  {indicator} {'OVERALL':<20} {overall:>10.2f}  {overall_pass:>9.0f}%  {len(all_scores):>8}")

    print("=" * 60)
    print()
