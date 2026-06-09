from mcp.server.fastmcp import FastMCP
from tools import get_leave_balance, get_attendance_summary, calculate_salary_projections, search_hr_policy

# Create an MCP server named "ERP_Tools"
mcp = FastMCP("ERP_Tools")

# Register our tools with the MCP protocol
mcp.tool()(get_leave_balance)
mcp.tool()(get_attendance_summary)
mcp.tool()(calculate_salary_projections)
mcp.tool()(search_hr_policy)

if __name__ == "__main__":
    # Start the MCP server using stdio transport
    mcp.run()
